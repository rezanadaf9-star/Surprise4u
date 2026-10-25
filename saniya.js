(() => {
  const cfg = window.SURPRISE_CONFIG || {};

  // =====================================================
  // 💗 EDIT HERE — sab kuch yahin se badlo
  // =====================================================
  const SANIYA = {
    creator: "Nadaf",

    // --- REEL MEDIA (optional) ---------------------------------
    // Apni video/reel ko assets/saniya/ folder mein daalo, phir naam likho:
    reelVideo: "",            // e.g. "assets/saniya/reel.mp4"
    // Ya Instagram reel ka link (public reel ka hi embed chalta hai):
    instagramReel: "",        // e.g. "https://www.instagram.com/reel/XXXXXXXX/"
    // Background song (optional, start button tap par chalega):
    song: "",                 // e.g. "assets/saniya/song.mp3"

    balloons: [
      "Tumhari smile dekh ke din ban jaata hai 😊",
      "Kuch log bas yunhi special lagte hain… tum unmein se ho 💗",
      "Tumse baat karna mera favourite part hai din ka ✨",
      "Tum jaisi koi nahi, sach mein 🤍",
      "Aur abhi toh sirf shuruaat hai… 🌹"
    ],
    chocolates: [
      "Thodi si mithaas… kyunki tum sweet ho, aur tumhare liye sweet cheezein banti hain 🍫",
      "Tum hasti ho na, toh sab kuch theek lagne lagta hai 💗",
      "Is chocolate se bhi zyada meetha ek hi cheez hai… tumhara naam 🤍"
    ],

    // Reel slides — ek slide = ek story. emoji/num/text/sub change kar sakte ho.
    slides: [
      { emoji: "🌙", text: "Tumse ek baat kehni hai…", sub: "Par pehle ye chhoti chhoti baatein suno 🤍" },
      { num: "1", text: "Tumhari smile din ki sabse achhi cheez hai.", sub: "Sach mein. Bina exaggerate kiye." },
      { num: "2", text: "Tumse baat karte waqt time ka pata hi nahi chalta.", sub: "Ghanta kab nikal jaata hai, samajh hi nahi aata ⏳" },
      { num: "3", text: "Tum jab hasti ho, sab kuch theek lagne lagta hai.", sub: "Thakaan, tension, sab halka ho jaata hai." },
      { num: "4", text: "Tum un logon mein se ho jinhe sochte hi chehre pe muskaan aa jaati hai 😊" },
      { num: "5", text: "Main perfect nahi hoon…", sub: "Par tumhare liye sincere hoon. Itna toh promise hai." },
      { num: "6", text: "Tumhare saath ek chhoti si chai bhi special lagegi ☕", sub: "Aur lambi drive toh uss se bhi zyada 🌆" },
      { emoji: "💗", text: "Aur sabse badi baat…", sub: "Tum mere dil mein bahut khaas jagah rakhti ho." }
    ],

    letter: [
      "Saniya,",
      "",
      "Main bahut dino se soch raha tha ki ye baat kaise kahun… phir socha, jo dil mein hai wahi seedha likh deta hoon.",
      "",
      "Tumse baat karna mere din ka sabse sukoon wala hissa ban gaya hai. Tumhari ek smile se meri poori thakaan utar jaati hai.",
      "",
      "Main koi filmy hero nahi hoon, aur bade bade wade bhi nahi karta. Par itna keh sakta hoon ki tumhari izzat karunga, tumhari baatein sununga, aur tumhare saath hamesha sach bolunga.",
      "",
      "Tum mujhe pasand ho… nahi, sach kahun toh mujhe tumse pyaar ho gaya hai. 🤍",
      "",
      "Isiliye ye chhoti si website banayi — kyunki tum mere liye chhoti baat nahi ho.",
      "",
      "Ab bas ek sawaal bacha hai…",
      "",
      "— {creator}"
    ],

    yes: {
      eye: "TUMNE HAAN KAHA 💗",
      title: "Yayyyy! 🥹",
      text: "Tumne mere dil ki sabse badi dua sun li.\n\nAaj se main tumhara, tum meri 🤍\nPromise, tumhe kabhi akela nahi chhodunga.\n\nAb ek screenshot le lo aur mujhe bata do ki tumne 'haan' bola 😭💗"
    },
    wait: {
      eye: "KOI BAAT NAHI 🤍",
      title: "Thank you for being honest",
      text: "Mujhe zara bhi bura nahi lag raha.\nTum jitna time lena chaho, lo.\n\nJawab jo bhi ho, tumhari izzat aur tumhari khushi mere liye utni hi important rahegi. 🤍"
    }
  };

  // =====================================================
  // Identity + analytics (same Supabase tables as the main site)
  // =====================================================
  const recipientId = "saniya-special";
  const state = { visitorId: null, sessionId: null, visitNumber: 1 };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    state.visitorId = localStorage.getItem("saniyaVisitor") || uid();
    localStorage.setItem("saniyaVisitor", state.visitorId);
    state.sessionId = sessionStorage.getItem("saniyaSession");
    if (!state.sessionId) {
      state.sessionId = uid();
      sessionStorage.setItem("saniyaSession", state.sessionId);
      state.visitNumber = Number(localStorage.getItem("saniyaVisits") || "0") + 1;
      localStorage.setItem("saniyaVisits", String(state.visitNumber));
    } else {
      state.visitNumber = Number(localStorage.getItem("saniyaVisits") || "1");
    }
  } catch (e) {
    state.visitorId = state.visitorId || uid();
    state.sessionId = state.sessionId || uid();
  }

  let supa = null;
  let queue = [];
  function loadSupabase() {
    if (!cfg.enableAnalytics || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = () => { supa = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey); flush(); };
    document.head.appendChild(s);
  }
  async function flush() {
    if (!supa || !queue.length) return;
    const batch = queue.splice(0, queue.length);
    const { error } = await supa.from("visitor_events").insert(batch);
    if (error) { console.warn("log failed", error.message); queue.unshift(...batch); }
  }
  function log(type, detail = {}) {
    if (!cfg.enableAnalytics) return;
    queue.push({
      session_id: state.sessionId, visitor_id: state.visitorId, visit_number: state.visitNumber,
      recipient_id: recipientId, recipient_name: "Saniya", nickname: null,
      event_type: type, detail, created_at: new Date().toISOString()
    });
    flush();
  }

  // =====================================================
  // Helpers
  // =====================================================
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const screens = $$(".screen");
  const toast = $("#toast");
  let floating = [];

  function toastMsg(t) {
    toast.textContent = t; toast.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function clearFloating() { floating.forEach(el => el.remove()); floating = []; }

  function show(id) {
    clearFloating();
    stopReel();
    screens.forEach(s => s.classList.remove("active"));
    const t = document.getElementById(id);
    if (!t) return;
    t.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    log("section_view", { section: id });
    if (id === "reel") startReel();
    if (id === "letter") typeLetter();
  }
  $$("[data-next]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.next === "balloons") startSong();
    show(b.dataset.next);
  }));

  // falling hearts in background
  (function rain() {
    const wrap = $("#rain");
    const icons = ["💗", "🌸", "🤍", "✨", "🌹"];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement("i");
      el.textContent = icons[i % icons.length];
      el.style.left = `${Math.random() * 100}%`;
      el.style.fontSize = `${12 + Math.random() * 16}px`;
      el.style.animationDuration = `${9 + Math.random() * 9}s`;
      el.style.animationDelay = `${-Math.random() * 14}s`;
      el.style.setProperty("--sx", `${(Math.random() - 0.5) * 80}px`);
      wrap.appendChild(el);
    }
  })();

  function petals(n = 60) {
    const icons = ["🌹", "💗", "🌸", "❤️", "✨"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.textContent = icons[i % icons.length];
      p.style.left = `${Math.random() * 100}vw`;
      p.style.fontSize = `${14 + Math.random() * 18}px`;
      p.style.animationDuration = `${3 + Math.random() * 3}s`;
      p.style.animationDelay = `${Math.random() * 1.6}s`;
      p.style.setProperty("--sx", `${(Math.random() - 0.5) * 160}px`);
      p.style.setProperty("--r", `${(Math.random() - 0.5) * 720}deg`);
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 7000);
    }
  }

  function placeMsg(el, x, y) {
    const w = el.offsetWidth || 280, h = el.offsetHeight || 60, edge = 14;
    const cx = Math.max(edge + w / 2, Math.min(window.innerWidth - edge - w / 2, x));
    const cy = Math.max(80 + h / 2, Math.min(window.innerHeight - 100 - h / 2, y));
    el.style.left = `${cx}px`; el.style.top = `${cy}px`;
  }

  function floatMessage(text, x, y) {
    floating.forEach(el => { el.classList.remove("show"); el.classList.add("out"); const o = el; setTimeout(() => o.remove(), 450); });
    floating = [];
    const el = document.createElement("div");
    el.className = "float-msg";
    el.textContent = text;
    document.body.appendChild(el);
    placeMsg(el, x, y);
    floating.push(el);
    requestAnimationFrame(() => el.classList.add("show"));
  }

  // soft sounds (Web Audio, no files)
  let actx;
  function ac() {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    if (!actx) actx = new C();
    if (actx.state === "suspended") actx.resume().catch(() => {});
    return actx;
  }
  function tone(c, f, t, d, type = "sine", v = 0.1, end = null) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (end) o.frequency.exponentialRampToValueAtTime(Math.max(1, end), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.015, d / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  }
  function sound(kind) {
    try {
      const c = ac(); if (!c) return;
      const t = c.currentTime + 0.01;
      if (kind === "pop") { tone(c, 220, t, 0.1, "triangle", 0.16, 70); tone(c, 1100, t, 0.04, "square", 0.03, 400); }
      else if (kind === "unwrap") { tone(c, 640, t, 0.09, "sine", 0.04, 420); tone(c, 880, t + 0.06, 0.12, "sine", 0.04); }
      else if (kind === "gift") { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, t + i * 0.1, 0.45, "sine", 0.1)); }
      else if (kind === "yes") { [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => tone(c, f, t + i * 0.12, 0.7, "sine", 0.1)); }
      else if (kind === "next") { tone(c, 700, t, 0.12, "sine", 0.05); }
    } catch (e) { /* sound is decorative */ }
  }

  function startSong() {
    if (!SANIYA.song) return;
    const a = $("#song");
    a.src = SANIYA.song; a.volume = 0.55;
    a.play().catch(() => {});
  }

  // =====================================================
  // STEP 1 — Heart balloons
  // =====================================================
  (function balloons() {
    const area = $("#balloonArea");
    const spots = [[22, 18, 1], [74, 14, .9], [46, 42, 1.1], [20, 66, .95], [76, 62, 1]];
    let popped = 0;
    spots.forEach(([l, tp, s], i) => {
      const b = document.createElement("button");
      b.className = "hb"; b.textContent = "❤️"; b.setAttribute("aria-label", `Heart ${i + 1}`);
      b.style.left = `${l}%`; b.style.top = `${tp}%`; b.style.setProperty("--s", s);
      b.style.animationDelay = `${-i * 0.7}s`;
      b.addEventListener("click", () => {
        if (b.classList.contains("gone")) return;
        sound("pop");
        const r = b.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        for (let k = 0; k < 8; k++) {
          const f = document.createElement("span");
          f.className = "frag"; f.textContent = ["💗", "✨", "🌸"][k % 3];
          f.style.left = `${x}px`; f.style.top = `${y}px`;
          const a = (Math.PI * 2 * k) / 8 + (Math.random() - 0.5) * 0.4, d = 60 + Math.random() * 80;
          f.style.setProperty("--dx", `${Math.cos(a) * d}px`);
          f.style.setProperty("--dy", `${Math.sin(a) * d}px`);
          f.style.setProperty("--r", `${(Math.random() - 0.5) * 600}deg`);
          document.body.appendChild(f); setTimeout(() => f.remove(), 900);
        }
        b.classList.add("gone");
        floatMessage(SANIYA.balloons[i], x, y);
        log("balloon_clicked", { index: i + 1, message: SANIYA.balloons[i] });
        if (++popped === spots.length) setTimeout(() => $("#balloonNextWrap").classList.remove("hidden"), 700);
      });
      area.appendChild(b);
    });
  })();

  // =====================================================
  // STEP 2 — Chocolates
  // =====================================================
  (function chocolates() {
    const area = $("#chocArea");
    let opened = 0;
    SANIYA.chocolates.forEach((text, i) => {
      const c = document.createElement("button");
      c.className = "choc"; c.setAttribute("aria-label", `Chocolate ${i + 1}`);
      c.innerHTML = '<span class="bar"></span><span class="cover">TAP</span>';
      c.addEventListener("click", () => {
        if (c.classList.contains("open")) return;
        sound("unwrap"); c.classList.add("open");
        const r = c.getBoundingClientRect();
        floatMessage(text, window.innerWidth / 2, r.top + r.height + 70);
        log("chocolate_opened", { index: i + 1, message: text });
        if (++opened === SANIYA.chocolates.length) setTimeout(() => $("#chocNextWrap").classList.remove("hidden"), 900);
      });
      area.appendChild(c);
    });
  })();

  // =====================================================
  // STEP 3 — Gift box -> reel
  // =====================================================
  let giftOpened = false;
  $("#giftBox").addEventListener("click", () => {
    if (giftOpened) return;
    giftOpened = true; sound("gift");
    $("#giftBox").classList.add("open");
    $("#giftHint").textContent = "✨ Ye dekho… ✨";
    petals(26);
    log("gift_box_opened");
    setTimeout(() => $("#giftReveal").classList.remove("hidden"), 900);
  });

  // =====================================================
  // STEP 4 — Reel (Instagram-story style)
  // =====================================================
  const SLIDE_MS = 5200;
  let reel = { i: 0, timer: null, elapsed: 0, paused: false, slides: [] };

  function buildSlides() {
    const list = [];
    if (SANIYA.reelVideo) list.push({ type: "video", src: SANIYA.reelVideo });
    else if (SANIYA.instagramReel) list.push({ type: "embed", src: SANIYA.instagramReel });
    SANIYA.slides.forEach(s => list.push({ type: "text", ...s }));
    return list;
  }

  function startReel() {
    reel.slides = buildSlides();
    reel.i = 0;
    $("#bars").innerHTML = reel.slides.map(() => "<span><b></b></span>").join("");
    $("#reelDone").classList.add("hidden");
    renderSlide();
    log("reel_started", { slides: reel.slides.length });
  }

  function stopReel() { clearInterval(reel.timer); reel.timer = null; const v = $("#slide video"); if (v) v.pause(); }

  function renderSlide() {
    stopReel();
    const s = reel.slides[reel.i], slide = $("#slide");
    const last = reel.i === reel.slides.length - 1;
    const bars = $$("#bars span");
    bars.forEach((b, k) => { b.classList.toggle("done", k < reel.i); $("b", b).style.width = k < reel.i ? "100%" : "0"; });
    slide.style.background = ["linear-gradient(160deg,#3b0d2a,#14040d)", "linear-gradient(160deg,#4a1034,#1b0614)", "linear-gradient(160deg,#2f0e3a,#12041a)", "linear-gradient(160deg,#5a1230,#1a0510)"][reel.i % 4];
    slide.className = "slide";
    slide.innerHTML = "";
    $("#slideNext").classList.add("hidden");

    if (s.type === "video") {
      slide.classList.add("has-media");
      slide.innerHTML = `<video src="${s.src}" playsinline controls autoplay></video>`;
      $("#slideNext").classList.remove("hidden");
      $("#tapL").style.display = $("#tapR").style.display = "none";
      return;
    }
    if (s.type === "embed") {
      slide.classList.add("has-media");
      const url = s.src.split("?")[0].replace(/\/?$/, "/") + "embed";
      slide.innerHTML = `<iframe src="${url}" allow="autoplay; encrypted-media" allowfullscreen scrolling="no"></iframe>`;
      $("#slideNext").classList.remove("hidden");
      $("#tapL").style.display = $("#tapR").style.display = "none";
      return;
    }
    $("#tapL").style.display = $("#tapR").style.display = "";
    slide.innerHTML = `
      ${s.emoji ? `<div class="big-emoji">${s.emoji}</div>` : ""}
      ${s.num ? `<div class="num">${s.num}</div>` : ""}
      <div class="txt">${s.text}</div>
      ${s.sub ? `<div class="sub">${s.sub}</div>` : ""}`;
    log("reel_slide_view", { index: reel.i + 1 });

    if (last) {
      $("b", bars[reel.i]).style.width = "100%";
      setTimeout(() => $("#reelDone").classList.remove("hidden"), 1200);
      return;
    }
    reel.elapsed = 0;
    reel.timer = setInterval(() => {
      if (reel.paused) return;
      reel.elapsed += 50;
      $("b", bars[reel.i]).style.width = `${Math.min(100, (reel.elapsed / SLIDE_MS) * 100)}%`;
      if (reel.elapsed >= SLIDE_MS) nextSlide();
    }, 50);
  }

  function nextSlide() { if (reel.i < reel.slides.length - 1) { reel.i++; sound("next"); renderSlide(); } }
  function prevSlide() { if (reel.i > 0) { reel.i--; renderSlide(); } }

  $("#tapR").addEventListener("click", nextSlide);
  $("#tapL").addEventListener("click", prevSlide);
  $("#slideNext").addEventListener("click", nextSlide);
  ["pointerdown"].forEach(e => $(".phone").addEventListener(e, () => { reel.paused = true; }));
  ["pointerup", "pointerleave", "pointercancel"].forEach(e => $(".phone").addEventListener(e, () => { reel.paused = false; }));

  // =====================================================
  // STEP 5 — Letter
  // =====================================================
  let typedOnce = false;
  function typeLetter() {
    const el = $("#typed"), btn = $("#letterNext");
    const text = SANIYA.letter.join("\n").replace("{creator}", SANIYA.creator);
    if (typedOnce) { el.textContent = text; btn.classList.remove("hidden"); return; }
    typedOnce = true; let i = 0; el.textContent = "";
    log("letter_viewed");
    const t = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(t); setTimeout(() => btn.classList.remove("hidden"), 400); }
    }, 28);
  }

  // =====================================================
  // STEP 6 — The question
  // =====================================================
  function finish(kind) {
    const d = SANIYA[kind];
    $("#finalEye").textContent = d.eye;
    $("#finalTitle").textContent = d.title;
    $("#finalText").textContent = d.text;
    $("#finalEmoji").textContent = kind === "yes" ? "🥹" : "🤍";
    log("proposal_answer", { answer: kind });
    show("final");
    if (kind === "yes") { sound("yes"); petals(90); setTimeout(() => petals(60), 1800); }
  }
  $("#yesBtn").addEventListener("click", () => finish("yes"));
  $("#waitBtn").addEventListener("click", () => finish("wait"));

  // =====================================================
  // Reply
  // =====================================================
  $("#sendReply").addEventListener("click", async () => {
    const text = $("#replyInput").value.trim();
    if (!text) { toastMsg("Kuch likh do, phir bhejna 🤍"); return; }
    const status = $("#replyStatus");
    status.className = "status"; status.textContent = "Bhej raha hoon…";
    log("message_send_started", { length: text.length });
    if (supa) {
      const { error } = await supa.from("visitor_messages").insert({
        session_id: state.sessionId, visitor_id: state.visitorId, visit_number: state.visitNumber,
        recipient_id: recipientId, recipient_name: "Saniya", nickname: null,
        message: text, created_at: new Date().toISOString()
      });
      if (error) { status.className = "status error"; status.textContent = "Abhi nahi ja paaya, ek baar phir try karo."; return; }
      $("#replyInput").hidden = true; $("#sendReply").hidden = true;
      status.textContent = "Message pahunch gaya 💗 Thank you!";
      sound("yes"); log("message_submitted", { length: text.length });
    } else {
      status.textContent = "Saved for demo. Supabase connect karo to message aap tak pahunchega.";
    }
  });

  loadSupabase();
  log("site_opened", { page: "saniya", visit_number: state.visitNumber });
})();
