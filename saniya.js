(() => {
  const cfg = window.SURPRISE_CONFIG || {};

  // =====================================================
  // 💗 EDIT HERE — all the text and links live in this block
  // {date} is replaced with the day she opens the page.
  // =====================================================
  const SANIYA = {
    creator: "Nadaf",

    // The two Instagram posts, shown inside the page (not opened on Instagram).
    embeds: [
      "https://www.instagram.com/p/DcanOvgTmHe/",
      "https://www.instagram.com/p/DczzIPBzlEZ/"
    ],
    // Background song: upload an mp3 named song.mp3 next to saniya.html (same folder).
    // It starts when the letter opens. Leave "" for no song.
    song: "song.mp3",
    // Second at which the song should start playing (so it begins at the best part,
    // e.g. the first chorus). 45 = starts at 0:45. Use 0 to play from the beginning.
    songStart: 128,

    stars: [
      "Tumse baat karte karte time kab nikal jaata hai, pata hi nahi chalta.",
      "Din kaisa bhi ho, tumhara ek message sab theek kar deta hai.",
      "Kabhi kabhi bas tumhari photo dekhne ka mann karta hai. Sach mein.",
      "Hum mile nahi hain, phir bhi tumhari kami har roz mehsoos hoti hai.",
      "Aaj mujhe tumse apne dil ki sabse badi baat kehni hai… bas thoda sa aur ruko."
    ],
    chocolates: [
      "Weekly ice cream date pakki. Flavour tum choose karna, bill meri taraf se.",
      "Momos bhi. Tum jitne khao, main kuch nahi bolunga.",
      "Jis din tum udaas ho, us din tumhe hasane ki zimmedari meri."
    ],

    slides: [
      { text: "Aaj {date} hai.", sub: "Aaj ka din main hamesha yaad rakhna chahta hoon." },
      { text: "Hum kabhi mile nahi, bas baatein hui hain.", sub: "Phir bhi tumse baat karna meri din ki sabse achhi cheez ban gayi hai." },
      { text: "Jis din tumse baat nahi hoti, din adhoora sa lagta hai." },
      { text: "Tumhari photo dekhne ka mann karta rehta hai.", sub: "Bas ek baar dekh loon, din ban jaata hai." },
      { text: "Main tumhe bahut miss karta hoon.", sub: "Bahut zyada." },
      { text: "Tumhara naam dekhte hi chehre pe muskaan aa jaati hai." },
      { emoji: "💗", text: "Aur sach ye hai ki mujhe tumse pyaar ho gaya hai.", sub: "Dil se, poori tarah." }
    ],

    // Each line becomes one chat bubble.
    letter: [
      "Saniya,",
      "Aaj {date} hai, aur main baith ke ye likh raha hoon. Kaafi socha ki kaise kahun, phir socha jo dil mein hai wahi seedha bol deta hoon.",
      "Hum kabhi mile nahi hain, sirf online baat hui hai. Par pata nahi kab tumse baat karna meri aadat ban gayi, aur ab tumhare bina din poora nahi lagta.",
      "Tumhare message ka wait rehta hai. Tumhari photo dekhne ka mann karta hai. Main tumhe bahut miss karta hoon, Saniya.",
      "Main tumhe rani ki tarah rakhunga. Kabhi dinner pe le jaunga, weekly ice cream ya momos khane, aur har 2-3 mahine mein sirf hum dono ek chhoti si trip pe.",
      "Main perfect nahi hoon, par tumhare saath hamesha sach bolunga. Tumhari izzat karunga, tumhari baatein sununga, aur jab bhi tum udaas hogi, tumhare saath rahunga.",
      "Mujhe tumse bahut pyaar hai. Aur ab main chahta hoon ki ye safar hum saath mein tay karein.",
      "Isiliye ye chhoti si website banayi. Ab bas ek sawaal bacha hai… 🤍",
      "— {creator}"
    ]
  };

  const todayText = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const fill = s => s.replace(/\{date\}/g, todayText).replace(/\{creator\}/g, SANIYA.creator);

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
    s.onerror = () => console.warn("Supabase library could not be loaded.");
    document.head.appendChild(s);
  }
  async function flush() {
    if (!supa || !queue.length) return;
    const batch = queue.splice(0, queue.length);
    try {
      const { error } = await supa.from("visitor_events").insert(batch);
      if (error) { console.warn("log failed", error.message); queue.unshift(...batch); }
    } catch (e) { queue.unshift(...batch); }
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
  let letterTimer = null;

  function toastMsg(t) {
    toast.textContent = t; toast.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("show"), 2000);
  }
  function clearFloating() { floating.forEach(el => el.remove()); floating = []; }

  function show(id) {
    clearFloating();
    stopReel();
    clearTimeout(letterTimer);
    screens.forEach(s => s.classList.remove("active"));
    const t = document.getElementById(id);
    if (!t) return;
    t.classList.add("active");
    noBtn.classList.toggle("hidden", id !== "ask");
    window.scrollTo({ top: 0, behavior: "smooth" });
    log("section_view", { section: id });
    if (id === "reel") startReel();
    if (id === "letter") typeLetter();
  }
  $$("[data-next]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.next === "letter") startSong();
    show(b.dataset.next);
  }));

  // greeting by time of day
  (function greet() {
    const h = new Date().getHours();
    const g = h < 5 ? "GOOD NIGHT" : h < 12 ? "GOOD MORNING" : h < 17 ? "GOOD AFTERNOON" : h < 21 ? "GOOD EVENING" : "GOOD NIGHT";
    $("#greeting").textContent = `${g}, SANIYA`;
  })();

  // starry sky
  (function sky() {
    const wrap = $("#sky");
    for (let i = 0; i < 90; i++) {
      const el = document.createElement("i");
      const size = Math.random() < 0.15 ? 3 : 2;
      el.style.width = el.style.height = `${size}px`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.animationDuration = `${2.5 + Math.random() * 4}s`;
      el.style.animationDelay = `${-Math.random() * 6}s`;
      wrap.appendChild(el);
    }
  })();

  // Roses rain down like a shower
  function petals(n = 60, spread = 1.6) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.textContent = Math.random() < 0.9 ? "🌹" : "🌸";
      p.style.left = `${Math.random() * 100}vw`;
      p.style.fontSize = `${18 + Math.random() * 20}px`;
      p.style.animationDuration = `${3 + Math.random() * 3}s`;
      p.style.animationDelay = `${Math.random() * spread}s`;
      p.style.setProperty("--sx", `${(Math.random() - 0.5) * 140}px`);
      p.style.setProperty("--r", `${(Math.random() - 0.5) * 540}deg`);
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 7500);
    }
  }
  function roseShower() {
    petals(70, 1.2);
    let rounds = 0;
    const t = setInterval(() => { petals(14, 0.6); if (++rounds >= 12) clearInterval(t); }, 650);
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
      if (kind === "pop") { [1318.5, 1760].forEach((f, i) => tone(c, f, t + i * 0.06, 0.3, "sine", 0.06)); }
      else if (kind === "unwrap") { tone(c, 640, t, 0.09, "sine", 0.04, 420); tone(c, 880, t + 0.06, 0.12, "sine", 0.04); }
      else if (kind === "gift") { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, t + i * 0.1, 0.45, "sine", 0.1)); }
      else if (kind === "yes") { [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => tone(c, f, t + i * 0.12, 0.7, "sine", 0.1)); }
      else if (kind === "sent") { tone(c, 784, t, 0.18, "sine", 0.08); tone(c, 1046.5, t + 0.12, 0.3, "sine", 0.08); }
      else if (kind === "next") { tone(c, 700, t, 0.12, "sine", 0.05); }
      else if (kind === "msg") { tone(c, 880, t, 0.1, "sine", 0.04); }
    } catch (e) { /* decorative */ }
  }
  function startSong() {
    if (!SANIYA.song) return;
    const a = $("#song");
    const from = Math.max(0, Number(SANIYA.songStart) || 0);
    a.loop = false;
    a.src = SANIYA.song;
    a.volume = 0;
    const begin = () => {
      try { if (from && a.duration && from < a.duration - 5) a.currentTime = from; } catch (e) {}
      a.play().then(() => {
        // gentle fade-in so it doesn't start abruptly
        let v = 0;
        const t = setInterval(() => { v = Math.min(0.5, v + 0.025); a.volume = v; if (v >= 0.5) clearInterval(t); }, 150);
      }).catch(() => {});
    };
    a.addEventListener("loadedmetadata", begin, { once: true });
    a.addEventListener("ended", () => { try { a.currentTime = from; a.play().catch(() => {}); } catch (e) {} });
    a.load();
  }

  // =====================================================
  // STEP 1 — Stars
  // =====================================================
  (function stars() {
    const area = $("#starArea");
    const spots = [[22, 18, 1], [74, 14, .9], [46, 42, 1.1], [20, 68, .95], [76, 62, 1]];
    let popped = 0;
    spots.forEach(([l, tp, s], i) => {
      const b = document.createElement("button");
      b.className = "star"; b.textContent = "⭐"; b.setAttribute("aria-label", `Star ${i + 1}`);
      b.style.left = `${l}%`; b.style.top = `${tp}%`; b.style.setProperty("--s", s);
      b.style.animationDelay = `${-i * 0.7}s`;
      b.addEventListener("click", () => {
        if (b.classList.contains("gone")) return;
        sound("pop");
        const r = b.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        for (let k = 0; k < 9; k++) {
          const f = document.createElement("span");
          f.className = "frag"; f.textContent = ["✨", "⭐", "💫"][k % 3];
          f.style.left = `${x}px`; f.style.top = `${y}px`;
          const a = (Math.PI * 2 * k) / 9 + (Math.random() - 0.5) * 0.4, d = 60 + Math.random() * 80;
          f.style.setProperty("--dx", `${Math.cos(a) * d}px`);
          f.style.setProperty("--dy", `${Math.sin(a) * d}px`);
          f.style.setProperty("--r", `${(Math.random() - 0.5) * 600}deg`);
          document.body.appendChild(f); setTimeout(() => f.remove(), 950);
        }
        b.classList.add("gone");
        floatMessage(SANIYA.stars[i], x, y);
        log("star_clicked", { index: i + 1, message: SANIYA.stars[i] });
        if (++popped === spots.length) setTimeout(() => $("#starNextWrap").classList.remove("hidden"), 900);
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
  // STEP 3 — Gift box
  // =====================================================
  let giftOpened = false;
  $("#giftBox").addEventListener("click", () => {
    if (giftOpened) return;
    giftOpened = true; sound("gift");
    $("#giftBox").classList.add("open");
    $("#giftHint").textContent = "✨ Look what's inside ✨";
    petals(26, 1);
    log("gift_box_opened");
    setTimeout(() => $("#giftReveal").classList.remove("hidden"), 900);
  });

  // =====================================================
  // STEP 4 — Embedded posts, then story slides
  // =====================================================
  const SLIDE_MS = 5200;
  let reel = { i: 0, timer: null, elapsed: 0, paused: false, slides: [] };

  function embedUrl(link) {
    const m = String(link).match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/` : null;
  }
  function buildSlides() {
    const list = [];
    SANIYA.embeds.forEach(link => { const u = embedUrl(link); if (u) list.push({ type: "embed", src: u }); });
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
  function stopReel() { clearInterval(reel.timer); reel.timer = null; }

  function renderSlide() {
    stopReel();
    const s = reel.slides[reel.i], slide = $("#slide");
    const last = reel.i === reel.slides.length - 1;
    const bars = $$("#bars span");
    bars.forEach((b, k) => { b.classList.toggle("done", k < reel.i); $("b", b).style.width = k < reel.i ? "100%" : "0"; });
    slide.style.background = ["linear-gradient(160deg,#241552,#070a1e)", "linear-gradient(160deg,#3a1650,#0a0a22)", "linear-gradient(160deg,#16205a,#060a1e)", "linear-gradient(160deg,#4a1a52,#0b0820)"][reel.i % 4];
    slide.className = "slide";
    slide.innerHTML = "";
    $("#mediaBar").classList.add("hidden");

    if (s.type === "embed") {
      slide.classList.add("has-media");
      slide.innerHTML = `<iframe src="${s.src}" allow="autoplay; encrypted-media; clipboard-write" allowfullscreen scrolling="yes" loading="eager" title="Instagram post"></iframe>`;
      $("#mediaBar").classList.remove("hidden");
      $("#tapL").style.display = $("#tapR").style.display = "none";
      $("#phoneHint").textContent = "Tap the post to play the music 🎵 • then press Next";
      log("embed_view", { index: reel.i + 1, src: s.src });
      return;
    }
    $("#phoneHint").textContent = "Tap the right side to continue • hold to pause";
    $("#tapL").style.display = $("#tapR").style.display = "";
    slide.innerHTML = `
      ${s.emoji ? `<div class="big-emoji">${s.emoji}</div>` : ""}
      <div class="txt">${fill(s.text)}</div>
      ${s.sub ? `<div class="sub">${fill(s.sub)}</div>` : ""}`;
    log("reel_slide_view", { index: reel.i + 1 });

    if (last) {
      $("b", bars[reel.i]).style.width = "100%";
      setTimeout(() => $("#reelDone").classList.remove("hidden"), 1400);
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
  $(".phone").addEventListener("pointerdown", () => { reel.paused = true; });
  ["pointerup", "pointerleave", "pointercancel"].forEach(e => $(".phone").addEventListener(e, () => { reel.paused = false; }));

  // =====================================================
  // STEP 5 — Letter as a chat
  // =====================================================
  let letterDone = false;
  function typeLetter() {
    const chat = $("#chat"), btn = $("#letterNext"), status = $("#chatStatus");
    const lines = SANIYA.letter.map(fill);
    chat.innerHTML = "";
    const addBubble = (text, sign) => {
      const b = document.createElement("div");
      b.className = "bubble" + (sign ? " sign" : "");
      b.textContent = text;
      chat.appendChild(b);
      chat.scrollTop = chat.scrollHeight;
      return b;
    };
    if (letterDone) { lines.forEach((l, i) => addBubble(l, i === lines.length - 1)); btn.classList.remove("hidden"); return; }
    btn.classList.add("hidden");
    log("letter_viewed");
    let i = 0;
    const next = () => {
      if (i >= lines.length) { status.textContent = "online"; status.classList.remove("typing"); letterDone = true; letterTimer = setTimeout(() => btn.classList.remove("hidden"), 500); return; }
      status.textContent = "typing…"; status.classList.add("typing");
      const dots = document.createElement("div");
      dots.className = "bubble typing"; dots.innerHTML = "<i></i><i></i><i></i>";
      chat.appendChild(dots); chat.scrollTop = chat.scrollHeight;
      const wait = Math.min(2600, 800 + lines[i].length * 16);
      letterTimer = setTimeout(() => {
        dots.remove();
        addBubble(lines[i], i === lines.length - 1);
        sound("msg");
        i++;
        letterTimer = setTimeout(next, 450);
      }, wait);
    };
    letterTimer = setTimeout(next, 600);
  }

  // =====================================================
  // STEP 6 — The question (Yes / a No that runs away)
  // =====================================================
  const noBtn = $("#noBtn");
  let noFloating = false, attempts = 0, lastPointer = { x: -999, y: -999 }, lastDodge = 0;
  const teases = [
    [3, "Nice try 😄"],
    [6, "That button doesn't want you to say No 😂"],
    [10, "It's really not going to let you 🥹"],
    [14, "Okay okay, just press Yes 🤍"]
  ];

  function dodge() {
    const now = Date.now();
    if (now - lastDodge < 120) return;
    lastDodge = now;
    attempts++;
    if (!noFloating) {
      noFloating = true;
      noBtn.classList.add("float");
      document.body.appendChild(noBtn);
    }
    const bw = noBtn.offsetWidth || 90, bh = noBtn.offsetHeight || 50, m = 12;
    const yes = $("#yesBtn").getBoundingClientRect();
    let x = m, y = m, tries = 0, ok = false;
    while (!ok && tries++ < 60) {
      x = m + Math.random() * Math.max(1, window.innerWidth - bw - 2 * m);
      y = m + Math.random() * Math.max(1, window.innerHeight - bh - 2 * m);
      const overlapsYes = x < yes.right + 16 && x + bw > yes.left - 16 && y < yes.bottom + 16 && y + bh > yes.top - 16;
      const dx = x + bw / 2 - lastPointer.x, dy = y + bh / 2 - lastPointer.y;
      const nearPointer = Math.hypot(dx, dy) < 150;
      ok = !overlapsYes && !nearPointer;
    }
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    let msg = "";
    teases.forEach(([n, t]) => { if (attempts >= n) msg = t; });
    $("#tease").textContent = msg;
    if ([1, 3, 6, 10, 15, 25].includes(attempts)) log("no_button_dodged", { attempts });
  }
  ["pointerenter", "mouseover", "pointerdown", "focus"].forEach(ev => noBtn.addEventListener(ev, e => { lastPointer = { x: e.clientX ?? lastPointer.x, y: e.clientY ?? lastPointer.y }; dodge(); if (ev === "focus") noBtn.blur(); }));
  noBtn.addEventListener("touchstart", e => { e.preventDefault(); const t = e.touches[0]; if (t) lastPointer = { x: t.clientX, y: t.clientY }; dodge(); }, { passive: false });
  noBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); dodge(); });
  // The button also leaps away when the pointer gets close, so it can't be caught.
  document.addEventListener("pointermove", e => {
    lastPointer = { x: e.clientX, y: e.clientY };
    if (!$("#ask").classList.contains("active")) return;
    const r = noBtn.getBoundingClientRect();
    if (!r.width) return;
    if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < Math.max(95, r.width)) dodge();
  });
  window.addEventListener("resize", () => {
    if (!noFloating) return;
    const r = noBtn.getBoundingClientRect();
    if (r.right > window.innerWidth || r.bottom > window.innerHeight) { lastDodge = 0; dodge(); }
  });

  $("#yesBtn").addEventListener("click", () => {
    log("proposal_answer", { answer: "yes", no_button_attempts: attempts });
    show("final");
    sound("yes");
    roseShower();
  });

  // =====================================================
  // Reply — Send Message → Sending… → green "Message Sent ✓"
  // =====================================================
  const withTimeout = (p, ms) => Promise.race([Promise.resolve(p), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
  async function waitForSupabase(ms) {
    const start = Date.now();
    while (!supa && Date.now() - start < ms) await new Promise(r => setTimeout(r, 200));
    return supa;
  }

  $("#sendReply").addEventListener("click", async () => {
    const btn = $("#sendReply"), input = $("#replyInput"), status = $("#replyStatus");
    const text = input.value.trim();
    if (!text) { toastMsg("Write something first 🤍"); return; }

    btn.classList.add("sending"); btn.textContent = "Sending…";
    status.className = "status"; status.textContent = "";
    log("message_send_started", { length: text.length });

    try {
      const client = await waitForSupabase(6000);
      if (!client) throw new Error("not connected");
      const { error } = await withTimeout(client.from("visitor_messages").insert({
        session_id: state.sessionId, visitor_id: state.visitorId, visit_number: state.visitNumber,
        recipient_id: recipientId, recipient_name: "Saniya", nickname: null,
        message: text, created_at: new Date().toISOString()
      }), 10000);
      if (error) throw error;

      btn.classList.remove("sending"); btn.classList.add("sent");
      btn.textContent = "✓ Message Sent";
      input.disabled = true;
      sound("sent");
      log("message_submitted", { length: text.length });
    } catch (err) {
      console.warn("send failed:", err && err.message);
      btn.classList.remove("sending"); btn.textContent = "Send Message";
      status.className = "status error";
      status.textContent = "Couldn't send. Please check your connection and try again.";
      log("message_send_failed", { length: text.length, error: String(err && err.message || err) });
    }
  });

  loadSupabase();
  log("site_opened", { page: "saniya", visit_number: state.visitNumber });
})();
