(() => {
  const cfg = window.SURPRISE_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const recipientId = (params.get("to") || "xyz").toLowerCase();
  const recipient = (cfg.recipients && cfg.recipients[recipientId]) || { name: "Friend" };

  // Anonymous, recipient-scoped visitor identity. It is kept only in this
  // browser's local storage so returning visits can be grouped without using
  // IP addresses, fingerprints, camera, microphone, or other hidden tracking.
  const visitorStorageKey = `pinkSurpriseVisitor:${recipientId}`;
  const visitStorageKey = `pinkSurpriseVisitCount:${recipientId}`;
  const sessionStorageKey = `pinkSurpriseSession:${recipientId}`;
  let visitorId = localStorage.getItem(visitorStorageKey);
  if (!visitorId) {
    visitorId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(visitorStorageKey, visitorId);
  }

  let visitNumber = Number(localStorage.getItem(visitStorageKey) || "0");
  const existingSessionId = sessionStorage.getItem(sessionStorageKey);
  const isNewVisit = !existingSessionId;
  const sessionId = existingSessionId || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  if (isNewVisit) {
    visitNumber += 1;
    localStorage.setItem(visitStorageKey, String(visitNumber));
    sessionStorage.setItem(sessionStorageKey, sessionId);
  }

  const state = {
    recipientId,
    knownName: recipient.name,
    nickname: "",
    events: new Set(),
    visitorId,
    visitNumber,
    sessionId
  };

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const screens = $$(".screen");
  const toast = $("#toast");
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  let supabaseClient = null;
  let eventQueue = [];
  let activeBalloonMessage = null;
  let activeChocolateMessage = null;

  // =====================================================
  // 💗 CUSTOM MESSAGES — EDIT ONLY THE TEXT BELOW
  // =====================================================
  // You can replace these lines with your own words.
  // The animations and positions will stay the same.
  const customMessages = {
    balloons: [
      "Tum Smile 😊 krti hui achi lgti ho",
      "Bas ek chhoti si smile tumhare liye 😊",
      "Kabhi kabhi bina kisi wajah ke khush rehna bhi zaroori hai. ✨",
      "Tumhari vibe mein kuch toh baat hai… bas yunhi rehna. 💗"
    ],
    chocolates: [
      "Thodi si mithaas… kyunki tumhare din mein ek sweet moment toh banta hai. 🍫",
      "Kuch surprises ka koi khaas reason nahi hota… bas dil kiya aur bana diya. 💗",
      "Jahan bhi jao, apni wahi khubsurat si vibe saath le jaana. ✨"
    ],
    gems: [
      "For your sparkle. ✨",
      "For your energy. 💗",
      "For all the little things that make you… you.",
      "Okay… this one is a little more personal. 👀"
    ],
    products: {
      dress: "A little something beautiful. 🌸 Some things just deserve to be noticed.",
      shoes: "For wherever your next adventure takes you. ✨",
      earrings: "A little extra sparkle never hurts. 💎",
      handbag: "For carrying all the important little things. 💗",
      perfume: "Something soft, something pretty… just because. 🌷"
    },
    personal: [
      "You know what?",
      "I know hmari baat nhi hoti h but yeah frrr v i can say",
      "ki tum bahut bahut bahuuuuuuut... achchi ho aur sabse alag ho.",
      "Koi bada reason nahi hai… bas thoda sa time, thodi si effort, aur tumhare liye specially banaya hua kuch.... 🌸. Waise kuch logon ke liye kuch banana thoda zyada hi achha lagta hai… tum unhi mein se ho. :) ✨",
      "I hope it made you smile.",
      "— Nadaf"
    ],
    personalByRecipient: {
      gunchasanam: [
        "Happy Boyfriend Day! 💗 (sorry kal tha)",
        "Okay… technically I'm not your boyfriend anymore 😅\nand maybe that's exactly why I wasn't sure whether I should send this.",
        "But some people remain special,\neven when the relationship becomes a memory.",
        "So no awkward expectations.\nNo pressure.\nJust a little surprise to make you smile today. 🌸",
        "Take care, keep smiling & stay happy. 💗",
        "Nadaf Reza---"
      ]
    },
    finalHintTitle: "Maybe I don't say it often…",
    finalHintText: "but I genuinely enjoy having you around.",
    finalHintSubtext: "That's probably enough said for now. 😌"
  };

  $("#knownName").textContent = state.knownName;
  $$('[data-nickname]').forEach(el => el.textContent = "you");
  document.title = `A Small Gift For ${state.knownName} 💗`;

  function loadSupabase() {
    if (!cfg.enableAnalytics || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = async () => {
      supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      await loadRecipientFromDatabase();
      flushEvents();
    };
    script.onerror = () => console.warn("Supabase client could not be loaded.");
    document.head.appendChild(script);
  }

  async function loadRecipientFromDatabase() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("surprise_recipients")
      .select("recipient_id,name")
      .eq("recipient_id", state.recipientId)
      .maybeSingle();

    if (error) {
      console.warn("Recipient name lookup failed:", error.message);
      return;
    }
    if (data?.name) {
      state.knownName = data.name;
      $("#knownName").textContent = data.name;
      document.title = `A Small Gift For ${data.name} 💗`;
      logEvent("recipient_name_loaded", { source: "supabase" });
    }
  }

  async function logEvent(type, detail = {}) {
    if (!cfg.enableAnalytics) return;
    eventQueue.push({
      session_id: state.sessionId,
      visitor_id: state.visitorId,
      visit_number: state.visitNumber,
      recipient_id: state.recipientId,
      recipient_name: state.knownName,
      nickname: state.nickname || null,
      event_type: type,
      detail,
      created_at: new Date().toISOString()
    });
    flushEvents();
  }

  async function flushEvents() {
    if (!supabaseClient || !eventQueue.length) return;
    const batch = eventQueue.splice(0, eventQueue.length);
    const { error } = await supabaseClient.from("visitor_events").insert(batch);
    if (error) {
      console.warn("Analytics insert failed:", error.message);
      eventQueue.unshift(...batch);
    }
  }

  function updateNicknames() {
    $$('[data-nickname]').forEach(el => el.textContent = state.nickname);
  }

  function removeTransientMessages() {
    [activeBalloonMessage, activeChocolateMessage].forEach(msg => {
      if (msg && msg.isConnected) msg.remove();
    });
    activeBalloonMessage = null;
    activeChocolateMessage = null;
    $$(".balloon-message, .chocolate-message").forEach(msg => msg.remove());
    toast.classList.remove("show");
    clearTimeout(toast._timer);
    closeModal();
  }

  function showScreen(id) {
    removeTransientMessages();
    screens.forEach(s => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    logEvent("section_view", { section: id });
  }

  function toastMsg(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 1900);
  }

  function confetti(n = 45) {
    for (let i = 0; i < n; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.style.left = "50%";
      c.style.top = "45%";
      c.style.background = ["#ff5c9d", "#ffd166", "#cda7ff", "#ffffff"][i % 4];
      c.style.setProperty("--x", `${(Math.random() - .5) * 95}vw`);
      c.style.setProperty("--y", `${(Math.random() - .5) * 90}vh`);
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1400);
    }
  }

  function createParticles() {
    const p = $("#particles");
    for (let i = 0; i < 34; i++) {
      const el = document.createElement("i");
      el.className = "particle";
      el.style.left = `${Math.random() * 100}%`;
      el.style.animationDelay = `${Math.random() * 7}s`;
      el.style.animationDuration = `${5 + Math.random() * 6}s`;
      p.appendChild(el);
    }
  }

  $("#nicknameForm").addEventListener("submit", e => {
    e.preventDefault();
    const val = $("#nicknameInput").value.trim();
    if (!val) return;
    state.nickname = val;
    updateNicknames();
    logEvent("nickname_entered", { nickname: val });
    showScreen("intro");
  });

  $$('[data-next]').forEach(btn => btn.addEventListener("click", () => showScreen(btn.dataset.next)));

  // Keep floating messages fully inside the visible screen, even when the
  // balloon/chocolate is close to an edge or the message is long.
  function placeFloatingMessage(el, originX, originY) {
    const edge = 16;
    const width = el.offsetWidth || Math.min(300, window.innerWidth - edge * 2);
    const height = el.offsetHeight || 60;
    const minX = edge + width / 2;
    const maxX = Math.max(minX, window.innerWidth - edge - width / 2);
    const minY = 72 + height / 2;
    const maxY = Math.max(minY, window.innerHeight - 76 - height / 2);
    const x = Math.max(minX, Math.min(maxX, originX));
    const y = Math.max(minY, Math.min(maxY, originY));
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.dataset.originX = originX;
    el.dataset.originY = originY;
  }

  function repositionActiveMessages() {
    [activeBalloonMessage, activeChocolateMessage].forEach(el => {
      if (!el || !el.isConnected) return;
      const x = Number(el.dataset.originX);
      const y = Number(el.dataset.originY);
      if (Number.isFinite(x) && Number.isFinite(y)) placeFloatingMessage(el, x, y);
    });
  }

  window.addEventListener("resize", repositionActiveMessages);

  // =====================================================
  // 🎈 BALLOONS — ONLY 4, REALISTIC 3D LOOK + FRAGMENTS
  // =====================================================
  function createBalloonFragments(balloon, index) {
    const rect = balloon.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const piece = document.createElement("span");
      piece.className = "balloon-fragment";
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;

      const angle = (Math.PI * 2 * i / 8) + (Math.random() - 0.5) * 0.45;
      const distance = 65 + Math.random() * 90;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rotate = (Math.random() - 0.5) * 900;
      piece.style.setProperty("--dx", `${dx}px`);
      piece.style.setProperty("--dy", `${dy}px`);
      piece.style.setProperty("--rot", `${rotate}deg`);
      piece.style.setProperty("--delay", `${Math.random() * 50}ms`);
      piece.style.setProperty("--hue", `${(index * 14 + i * 5) % 360}`);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 850);
    }
  }

  function setupBalloons() {
    const area = $("#balloonArea");
    let poppedBalloons = 0;
    const positions = [
      { left: 17, top: 27, scale: 1.02, delay: -1.2 },
      { left: 70, top: 20, scale: .94, delay: -.2 },
      { left: 37, top: 55, scale: 1.1, delay: -2.1 },
      { left: 77, top: 58, scale: .88, delay: -1.7 }
    ];

    positions.forEach((pos, i) => {
      const b = document.createElement("button");
      b.className = "balloon";
      b.type = "button";
      b.setAttribute("aria-label", `Pop balloon ${i + 1}`);
      b.style.left = `${pos.left}%`;
      b.style.top = `${pos.top}%`;
      b.style.setProperty("--balloon-scale", pos.scale);
      b.style.animationDelay = `${pos.delay}s`;
      b.innerHTML = `<span class="balloon-shine"></span><span class="balloon-knot"></span><span class="balloon-string"></span>`;

      b.addEventListener("click", () => {
        if (b.classList.contains("popping")) return;
        const rect = b.getBoundingClientRect();
        createBalloonFragments(b, i);
        b.classList.add("popping");
        setTimeout(() => b.classList.add("gone"), 150);

        if (activeBalloonMessage && activeBalloonMessage.isConnected) {
          activeBalloonMessage.classList.remove("show", "settle");
          activeBalloonMessage.classList.add("fade-out");
          const oldMessage = activeBalloonMessage;
          setTimeout(() => oldMessage.remove(), 360);
        }

        const message = document.createElement("div");
        message.className = "balloon-message";
        message.textContent = customMessages.balloons[i];
        document.body.appendChild(message);
        placeFloatingMessage(message, rect.left + rect.width / 2, rect.top + rect.height / 2);
        activeBalloonMessage = message;
        requestAnimationFrame(() => message.classList.add("show"));
        setTimeout(() => message.classList.add("settle"), 420);

        poppedBalloons += 1;
        logEvent("balloon_clicked", { index: i + 1, message: customMessages.balloons[i] });

        if (poppedBalloons === positions.length) {
          setTimeout(() => {
            const wrap = $("#balloonNextWrap");
            wrap.classList.remove("hidden");
            wrap.classList.add("ready");
          }, 650);
          confetti(22);
        }
      });
      area.appendChild(b);
    });
  }

  $("#balloonNext").addEventListener("click", () => { logEvent("next_button_clicked", { from: "balloons", to: "chocolates" }); showScreen("chocolates"); });

  // =====================================================
  // 🍫 CHOCOLATES — ONLY 3, COVER/UNWRAP + LOCAL MESSAGE
  // =====================================================
  function setupChocolates() {
    const area = $("#chocolateArea");

    for (let i = 0; i < 3; i++) {
      const b = document.createElement("button");
      b.className = "choc";
      b.type = "button";
      b.setAttribute("aria-label", `Unwrap chocolate ${i + 1}`);
      b.innerHTML = `
        <span class="choc-shadow"></span>
        <span class="choc-body">
          <span class="choc-top"></span>
          <span class="choc-wrap"></span>
          <span class="choc-cover">TAP</span>
          <span class="choc-glint"></span>
        </span>`;

      b.addEventListener("click", () => {
        if (b.classList.contains("open")) return;
        const rect = b.getBoundingClientRect();
        b.classList.add("open");

        if (activeChocolateMessage && activeChocolateMessage.isConnected) {
          activeChocolateMessage.classList.remove("show");
          activeChocolateMessage.classList.add("fade-out");
          const oldMessage = activeChocolateMessage;
          setTimeout(() => oldMessage.remove(), 360);
        }

        const message = document.createElement("div");
        message.className = "chocolate-message";
        message.textContent = customMessages.chocolates[i];
        document.body.appendChild(message);
        placeFloatingMessage(message, rect.left + rect.width / 2, rect.top + rect.height / 2);
        activeChocolateMessage = message;
        requestAnimationFrame(() => message.classList.add("show"));

        logEvent("chocolate_opened", { index: i + 1, message: customMessages.chocolates[i] });

        if ($$(".choc.open", area).length === 3) {
          setTimeout(() => {
            const wrap = $("#chocolateNextWrap");
            wrap.classList.remove("hidden");
            wrap.classList.add("ready");
          }, 850);
          confetti(18);
        }
      });
      area.appendChild(b);
    }
  }

  $("#chocolateNext").addEventListener("click", () => { logEvent("next_button_clicked", { from: "chocolates", to: "gift" }); showScreen("gift"); });

  // =====================================================
  // 🎁 GIFT BOX + FIVE PRODUCTS IN ONE ROW
  // =====================================================
  let openedProducts = new Set();
  let giftOpened = false;

  $("#giftBox").addEventListener("click", openGift);
  $("#giftBox").addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGift();
    }
  });

  function openGift() {
    if (giftOpened) return;
    giftOpened = true;
    $("#giftBox").classList.add("open");
    $("#giftInstruction").textContent = "✨ Your gifts are here — tap any item to explore it ✨";
    logEvent("gift_box_opened");

    setTimeout(() => {
      $("#giftContents").classList.remove("hidden");
      $("#giftContents").classList.add("reveal-products");
      confetti(55);

      // Let every card finish rising, then clear the stage so the navigation
      // control has its own space below the gifts.
      setTimeout(() => {
        $("#giftBox").classList.add("exit");
        logEvent("gift_box_cleared", { reason: "all_gift_cards_revealed" });
      }, 1700);
    }, 700);
  }

  const productInfo = {
    dress: { title: "Dress", text: customMessages.products.dress, img: "assets/dress.png" },
    shoes: { title: "Shoes", text: customMessages.products.shoes, img: "assets/shoes.png" },
    earrings: { title: "Earrings", text: customMessages.products.earrings, img: "assets/earings.png" },
    handbag: { title: "Handbag", text: customMessages.products.handbag, img: "assets/handbag.png" },
    perfume: { title: "Perfume", text: customMessages.products.perfume, img: "assets/perfume.png" }
  };

  $$(".product").forEach(btn => btn.addEventListener("click", () => openProduct(btn.dataset.product, btn)));

  function openProduct(key, btn) {
    if (!giftOpened) return;
    openedProducts.add(key);
    const info = productInfo[key];

    logEvent("gift_item_clicked", { item: key, title: info.title, message: info.text });

    modalBody.innerHTML = `
      <p class="eyebrow">A LITTLE GIFT</p>
      <h2>${info.title}</h2>
      <img id="modalProduct" src="${info.img}" alt="${info.title}">
      <p class="modal-message">${info.text}</p>
    `;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    logEvent("gift_item_modal_opened", { item: key, title: info.title });

    if (key === "dress") {
      const folded = btn.querySelector("img");
      folded.src = "assets/dress.png";
      folded.classList.add("dress-reveal");
      folded.alt = "Revealed dress";
    }

    if (openedProducts.size === 1) {
      setTimeout(() => {
        $("#giftNextWrap").classList.remove("hidden");
        $("#giftNextWrap").classList.add("ready");
      }, 350);
    }
  }

  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  function closeModal() {
    if (modal.classList.contains("show")) logEvent("gift_item_modal_closed");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  $("#giftNext").addEventListener("click", () => { logEvent("next_button_clicked", { from: "gift", to: "message" }); showScreen("message"); });

  // =====================================================
  // 💌 PERSONAL MESSAGE
  // =====================================================
  function finalText() {
    const recipientMessage = customMessages.personalByRecipient?.[state.recipientId];
    const lines = recipientMessage || customMessages.personal;
    return lines.join("\n").replace("— Nadaf", `— ${cfg.creatorName || "Nadaf"}`).replace("Nadaf Reza---", `${cfg.creatorName || "Nadaf"} Reza---`);
  }

  $("#messageNext").addEventListener("click", () => { logEvent("next_button_clicked", { from: "message", to: "hint" }); showScreen("hint"); });

  function typeMessage() {
    const el = $("#typedCopy");
    const text = finalText();
    let i = 0;
    el.textContent = "";
    const timer = setInterval(() => {
      el.textContent = text.slice(0, i++);
      if (i > text.length) {
        clearInterval(timer);
        $("#messageNext").classList.remove("hidden");
      }
    }, 18);
  }

  const observer = new MutationObserver(() => {
    if ($("#message").classList.contains("active") && !state.events.has("message")) {
      state.events.add("message");
      typeMessage();
      logEvent("personal_message_viewed");
    }
  });
  observer.observe($("#message"), { attributes: true, attributeFilter: ["class"] });

  $("#hint h1").textContent = customMessages.finalHintTitle;
  $("#hint .lead").textContent = customMessages.finalHintText;
  $("#hint .subtle-line").textContent = customMessages.finalHintSubtext;
  $("#replyNext").addEventListener("click", () => { logEvent("reply_screen_opened"); showScreen("reply"); });

  $("#sendReply").addEventListener("click", async () => {
    const text = $("#replyInput").value.trim();
    if (!text) {
      toastMsg("You can leave it blank if you want 😊");
      return;
    }

    const status = $("#replyStatus");
    status.className = "status sending";
    status.innerHTML = '<span>Sending…</span>';
    logEvent("message_send_started", { length: text.length });

    if (supabaseClient) {
      const { error } = await supabaseClient.from("visitor_messages").insert({
        session_id: state.sessionId,
        visitor_id: state.visitorId,
        visit_number: state.visitNumber,
        recipient_id: state.recipientId,
        recipient_name: state.knownName,
        nickname: state.nickname,
        message: text,
        created_at: new Date().toISOString()
      });
      if (error) {
        status.className = "status error";
        status.innerHTML = '<span>Couldn’t send right now. You can try again.</span>';
        logEvent("message_send_failed", { length: text.length, error: error.message });
      } else {
        status.className = "status success";
        status.innerHTML = '<span class="success-icon" aria-hidden="true">✓</span><span>Message sent 💗</span>';
        logEvent("message_submitted", { length: text.length });
      }
    } else {
      status.className = "status demo";
      status.innerHTML = '<span class="success-icon" aria-hidden="true">✓</span><span>Saved for this demo. Connect Supabase to receive messages.</span>';
      logEvent("message_submitted_demo", { length: text.length });
    }
  });

  createParticles();
  setupBalloons();
  setupChocolates();
  loadSupabase();
  logEvent("site_opened", {
    path: location.pathname,
    queryRecipient: recipientId,
    is_return_visit: visitNumber > 1,
    visit_number: visitNumber
  });
  if (isNewVisit) {
    logEvent("visit_started", { visit_number: visitNumber, is_return_visit: visitNumber > 1 });
  }
})();
