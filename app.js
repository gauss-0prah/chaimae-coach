/* Shared behaviour for every language version.
   Each page defines window.T (its own text) before loading this file. */
const WHATSAPP = "212772581128";           // international format, no "+"
const waLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/* WhatsApp links */
document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = waLink(a.dataset.wa);
  a.target = "_blank"; a.rel = "noopener";
});

/* Nav */
const nav = document.getElementById("nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 20), {passive:true});
const links = document.getElementById("navLinks");
document.getElementById("burger").onclick = () => links.classList.toggle("open");
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

/* Reveal on scroll + counter */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  e.target.querySelectorAll("[data-count]").forEach(countUp);
  io.unobserve(e.target);
}), {threshold:.15});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
function countUp(el){
  const end = +el.dataset.count; let t0;
  const step = t => { t0 ??= t; const p = Math.min((t - t0) / 1600, 1);
    const n = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString(T.locale, {useGrouping: T.group !== false});
    el.innerHTML = `<span class="ltr">${n}${p === 1 ? "+" : ""}</span>`;  // keep "6000+" in order in RTL pages
    if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* Hero orb text synced with the 10s breathe animation */
const orbText = document.getElementById("orbText");
(function orbLoop(){
  orbText.textContent = T.orb[0];
  setTimeout(() => orbText.textContent = T.orb[1], 4000);
  setTimeout(() => orbText.textContent = T.orb[2], 5000);
  setTimeout(orbLoop, 10000);
})();

/* Offer buttons preselect service in booking form */
document.querySelectorAll("[data-service]").forEach(b => b.addEventListener("click", () => {
  const r = document.getElementById(b.dataset.service);
  if (r) r.checked = true;
}));

/* Booking form -> WhatsApp prefilled message */
const fDate = document.getElementById("fDate");
fDate.min = new Date().toISOString().split("T")[0];
document.getElementById("bookForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, v = n => (f.elements[n].value || "").trim();
  const err = document.getElementById("formErr");
  if (!v("name") || v("phone").replace(/\D/g, "").length < 8) { err.style.display = "block"; return; }
  err.style.display = "none";
  const B = T.booking;
  const date = v("date")
    ? new Date(v("date") + "T12:00").toLocaleDateString(T.locale, {weekday:"long", day:"numeric", month:"long"})
    : B.tbd;
  const msg = [
    B.hello, B.intro, "",
    `• ${B.service} : ${f.elements.service.value}`,
    `• ${B.name} : ${v("name")}`,
    `• ${B.phone} : ${v("phone")}`,
    `• ${B.date} : ${date}`,
    `• ${B.time} : ${v("time")}`,
    `• ${B.mode} : ${v("mode")}`,
    v("country") && `• ${B.country} : ${v("country")}`,
    v("msg") && `\n${B.change} :\n${v("msg")}`
  ].filter(Boolean).join("\n");
  window.open(waLink(msg), "_blank", "noopener");
});

/* Mindset quiz: option index 1 = growth answer */
const Q = T.quiz.questions;
let qi = 0, score = 0;
const qBox = document.getElementById("qBox"), qBar = document.getElementById("qBar");
function renderQ(){
  qBar.style.width = (qi / Q.length * 100) + "%";
  if (qi < Q.length) {
    const [q, opts] = Q[qi];
    const order = Math.random() < .5 ? [0,1] : [1,0];
    qBox.innerHTML = `<div class="q-step on"><h4>${qi+1}. ${q}</h4><div class="q-opts">${order.map(i => `<button data-v="${i}">${opts[i]}</button>`).join("")}</div></div>`;
    qBox.querySelectorAll("button").forEach(b => b.onclick = () => { score += +b.dataset.v; qi++; renderQ(); });
    return;
  }
  const r = T.quiz.results[score >= 4 ? 0 : score >= 2 ? 1 : 2];
  qBox.innerHTML = `<div class="q-step on q-result"><div class="big">${r[0]}</div><h4>${r[1]}</h4><p>${r[2]}</p>
    <div class="row"><a class="btn btn-clay" href="${waLink(T.quiz.waMsg(r[1]))}" target="_blank" rel="noopener">${T.quiz.cta}</a></div>
    <button class="linkbtn" id="qAgain">${T.quiz.again}</button></div>`;
  document.getElementById("qAgain").onclick = () => { qi = 0; score = 0; renderQ(); };
}
renderQ();

/* Breathing exercise: 4s in, 1s hold, 6s out, 5 cycles */
const bc = document.getElementById("bc"), bText = document.getElementById("bText"), bBtn = document.getElementById("bBtn");
let bTimers = [];
bBtn.onclick = () => {
  bTimers.forEach(clearTimeout); bTimers = [];
  bBtn.textContent = T.breath.restart;
  const cycles = 5, len = 11000;
  for (let c = 0; c < cycles; c++) {
    const t = c * len;
    bTimers.push(setTimeout(() => { bc.className = "bcircle in"; bText.textContent = T.breath.in; }, t));
    bTimers.push(setTimeout(() => { bc.className = "bcircle hold"; bText.textContent = T.breath.hold; }, t + 4000));
    bTimers.push(setTimeout(() => { bc.className = "bcircle out"; bText.textContent = T.breath.out; }, t + 5000));
  }
  bTimers.push(setTimeout(() => { bc.className = "bcircle"; bText.textContent = T.breath.done; }, cycles * len));
};

document.getElementById("yr").textContent = new Date().getFullYear();

/* Seigaiha (青海波) wave pattern, generated so colours stay in one place */
function seigaiha(bg, line){
  const R = 40, rows = [[-20,[0,80]],[0,[40]],[20,[0,80]],[40,[40]],[60,[0,80]]];
  const scale = (cx, cy) => [R, 32, 24, 16, 8].map((r, i) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${i ? "none" : bg}" stroke="${line}" stroke-width="1.4"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40">${rows.map(([y, xs]) => xs.map(x => scale(x, y)).join("")).join("")}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
document.documentElement.style.setProperty("--seigaiha", seigaiha("#f1e8dc", "rgba(63,95,76,.075)"));
document.documentElement.style.setProperty("--seigaiha-dark", seigaiha("#3f5f4c", "rgba(255,255,255,.07)"));

/* Sakura petals drifting across the page */
(function sakura(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas"), ctx = cv.getContext("2d");
  cv.id = "sakura"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  let W, H, dpr, petals = [], wind = 0, lastY = scrollY, running = true;

  const rand = (a, b) => a + Math.random() * (b - a);
  const spawn = top => ({
    x: rand(0, W), y: top ? rand(-H, 0) : rand(0, H),
    s: rand(6, 12), vy: rand(.35, .9), vx: rand(.1, .45),
    sway: rand(.6, 1.6), swayF: rand(.006, .014), t: rand(0, 1000),
    rot: rand(0, Math.PI * 2), vr: rand(-.02, .02), flip: rand(.02, .05),
    hue: rand(340, 355), light: rand(84, 92)
  });
  function resize(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(8, Math.min(22, Math.round(W / 75)));
    while (petals.length < n) petals.push(spawn(false));
    petals.length = n;
  }
  function petal(p){
    const s = p.s;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.scale(1, Math.cos(p.t * p.flip));             // flutter: petal turning in the air
    ctx.beginPath();                                    // sakura petal with the notch at its tip
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s * .9, s * .35, -s * .75, -s * .75, -s * .28, -s);
    ctx.lineTo(0, -s * .72);
    ctx.lineTo(s * .28, -s);
    ctx.bezierCurveTo(s * .75, -s * .75, s * .9, s * .35, 0, s);
    const g = ctx.createLinearGradient(0, s, 0, -s);
    g.addColorStop(0, `hsla(${p.hue},70%,${p.light - 6}%,.85)`);
    g.addColorStop(1, `hsla(${p.hue},80%,${p.light + 4}%,.75)`);
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }
  function frame(){
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    wind *= .96;
    for (const p of petals) {
      p.t++;
      p.x += p.vx + Math.sin(p.t * p.swayF) * p.sway * .5 + wind;
      p.y += p.vy + Math.abs(wind) * .3;
      p.rot += p.vr;
      if (p.y > H + 20 || p.x > W + 20 || p.x < -20) Object.assign(p, spawn(true), {y: -20});
      petal(p);
    }
    requestAnimationFrame(frame);
  }
  addEventListener("resize", resize);
  addEventListener("scroll", () => {                    // scrolling stirs a light breeze
    wind = Math.max(-2.5, Math.min(2.5, wind + (scrollY - lastY) * .02));
    lastY = scrollY;
  }, {passive:true});
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });
  resize(); requestAnimationFrame(frame);
})();
