// 인트로 잠금 화면: 야경 도시 → 클릭하면 로그인 화면 → 버튼을 누르면 포트폴리오
(function () {
  var root = document.documentElement;
  var lock = document.getElementById("lock");
  if (!lock) return;
  if (!root.classList.contains("locked")) {
    lock.remove();
    return;
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. 도시 그리기 ----------
  var NS = "http://www.w3.org/2000/svg";
  var W = 1600;
  var H = 900;
  var GROUND = H - 70;
  var svg = document.getElementById("city");

  // 매번 같은 도시가 나오도록 고정 시드 난수
  var seed = 2026;
  function rand() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function range(a, b) {
    return a + rand() * (b - a);
  }
  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // 그라데이션 정의
  var defs = el("defs", {}, svg);
  var moonGlow = el("radialGradient", { id: "moonGlow" }, defs);
  el("stop", { offset: "0", "stop-color": "#f6e7c1", "stop-opacity": "0.55" }, moonGlow);
  el("stop", { offset: "1", "stop-color": "#f6e7c1", "stop-opacity": "0" }, moonGlow);
  var fog = el("linearGradient", { id: "fog", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
  el("stop", { offset: "0", "stop-color": "#b9a3d6", "stop-opacity": "0" }, fog);
  el("stop", { offset: "1", "stop-color": "#b9a3d6", "stop-opacity": "0.22" }, fog);

  // 별
  var stars = el("g", {}, svg);
  for (var i = 0; i < 90; i++) {
    el("circle", {
      class: "star",
      cx: range(0, W).toFixed(1),
      cy: range(0, H * 0.5).toFixed(1),
      r: range(0.5, 1.6).toFixed(2),
      fill: "#ffffff",
      style: "animation-delay:" + range(0, 3).toFixed(2) + "s"
    }, stars);
  }

  // 달
  el("circle", { cx: 1260, cy: 160, r: 90, fill: "url(#moonGlow)" }, svg);
  el("circle", { cx: 1260, cy: 160, r: 22, fill: "#f6e7c1" }, svg);

  // 지나가는 비행기 불빛
  var plane = el("g", { class: "plane" }, svg);
  el("circle", { cx: 0, cy: 120, r: 2, fill: "#ffffff" }, plane);
  el("circle", { class: "beacon", cx: 6, cy: 120, r: 1.8, fill: "#ff5a5a" }, plane);

  // 빌딩 층: 먼 층은 흐리고 느리게, 가까운 층은 진하고 빠르게
  var layers = [
    { id: "far", hMin: 120, hMax: 340, wMin: 40, wMax: 90, color: "#1c2758", winP: 0.16, win: 3, par: 6 },
    { id: "mid", hMin: 180, hMax: 480, wMin: 50, wMax: 110, color: "#131d47", winP: 0.26, win: 4, par: 14 },
    { id: "near", hMin: 240, hMax: 650, wMin: 64, wMax: 140, color: "#0a1131", winP: 0.34, win: 5, par: 26 }
  ];
  var parallax = [];

  layers.forEach(function (L) {
    var outer = el("g", { class: "par" }, svg);
    var drift = el("g", { class: "drift drift-" + L.id }, outer);
    var g = el("g", { id: "layer-" + L.id }, drift);
    parallax.push({ node: outer, par: L.par });

    var x = range(-20, 0);
    while (x < W) {
      var w = range(L.wMin, L.wMax);
      var h = range(L.hMin, L.hMax);
      var top = GROUND - h;
      el("rect", { x: x.toFixed(1), y: top.toFixed(1), width: w.toFixed(1), height: h.toFixed(1), fill: L.color }, g);
      // 유리 외벽 하이라이트
      el("rect", { x: x.toFixed(1), y: top.toFixed(1), width: (w * 0.16).toFixed(1), height: h.toFixed(1), fill: "#ffffff", opacity: "0.04" }, g);

      // 가까운 층 고층 빌딩: 계단식 꼭대기 + 안테나 경고등
      if (L.id !== "far" && h > L.hMax * 0.7) {
        var cw = w * range(0.4, 0.65);
        var ch = range(14, 34);
        el("rect", { x: (x + (w - cw) / 2).toFixed(1), y: (top - ch).toFixed(1), width: cw.toFixed(1), height: ch.toFixed(1), fill: L.color }, g);
        var ax = x + w / 2;
        var ay = top - ch;
        el("line", { x1: ax.toFixed(1), y1: ay.toFixed(1), x2: ax.toFixed(1), y2: (ay - range(18, 40)).toFixed(1), stroke: L.color, "stroke-width": 2 }, g);
        el("circle", {
          class: "beacon",
          cx: ax.toFixed(1),
          cy: (ay - 40).toFixed(1),
          r: 2.4,
          fill: "#ff4d4d",
          style: "animation-delay:" + range(0, 1.6).toFixed(2) + "s"
        }, g);
      }

      // 창문 불빛
      var step = L.win * 2.4;
      for (var wx = x + 6; wx < x + w - L.win - 4; wx += step) {
        for (var wy = top + 10; wy < GROUND - 8; wy += step * 1.3) {
          if (rand() > L.winP) continue;
          var warm = rand() < 0.7;
          var attrs = {
            x: wx.toFixed(1),
            y: wy.toFixed(1),
            width: L.win,
            height: (L.win * 1.3).toFixed(1),
            fill: warm ? "#ffd27a" : "#9fd3ff",
            opacity: range(0.45, 0.95).toFixed(2)
          };
          if (rand() < 0.05) {
            attrs["class"] = "tw";
            attrs.style = "animation-delay:" + range(0, 4).toFixed(2) + "s";
          }
          el("rect", attrs, g);
        }
      }
      x += w + range(2, 14);
    }
    // 끊김 없이 흘러가도록 같은 층을 오른쪽에 한 벌 더
    el("use", { href: "#layer-" + L.id, x: W }, drift);
  });

  // 지평선 안개
  el("rect", { x: 0, y: GROUND - 260, width: W, height: 260, fill: "url(#fog)" }, svg);

  // 도로와 차량 불빛 궤적
  el("rect", { x: 0, y: GROUND, width: W, height: H - GROUND, fill: "#060a1c" }, svg);
  el("line", { x1: 0, y1: GROUND + 34, x2: W, y2: GROUND + 34, stroke: "#ffffff", "stroke-opacity": "0.12", "stroke-dasharray": "24 18" }, svg);
  [
    { y: GROUND + 18, c: "#ff5a5a", rev: false, d: 2.6 },
    { y: GROUND + 26, c: "#ff7a5a", rev: false, d: 3.4 },
    { y: GROUND + 44, c: "#ffe3a3", rev: true, d: 2.2 },
    { y: GROUND + 54, c: "#fff1cf", rev: true, d: 3.0 }
  ].forEach(function (t) {
    el("line", {
      class: "trail" + (t.rev ? " rev" : ""),
      x1: 0, y1: t.y, x2: W, y2: t.y,
      stroke: t.c,
      "stroke-width": 2.4,
      "stroke-linecap": "round",
      "stroke-dasharray": "50 350",
      style: "animation-duration:" + t.d + "s"
    }, svg);
  });

  // 마우스를 움직이면 층마다 다르게 따라 움직임 (원근감)
  if (!reduce) {
    var pending = false;
    var mx = 0;
    var my = 0;
    lock.addEventListener("mousemove", function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        parallax.forEach(function (p) {
          p.node.style.transform = "translate(" + (-mx * p.par).toFixed(1) + "px," + (-my * p.par * 0.4).toFixed(1) + "px)";
        });
        pending = false;
      });
    });
  }

  // ---------- 2. 시계 ----------
  var timeEl = document.getElementById("lockTime");
  var dateEl = document.getElementById("lockDate");
  var days = ["일", "월", "화", "수", "목", "금", "토"];
  function tick() {
    var d = new Date();
    timeEl.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    dateEl.textContent = (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + days[d.getDay()] + "요일";
  }
  tick();
  var clock = setInterval(tick, 10000);

  // ---------- 3. 잠금 해제 흐름 ----------
  var enterBtn = document.getElementById("lockEnter");
  var stage = "clock";

  function showLogin() {
    if (stage !== "clock") return;
    stage = "login";
    lock.classList.add("lock--login");
    setTimeout(function () { enterBtn.focus(); }, 300);
  }

  function enter() {
    if (stage === "out") return;
    stage = "out";
    lock.classList.add("lock--out");
    try { sessionStorage.setItem("unlocked", "1"); } catch (e) {}
    setTimeout(function () {
      clearInterval(clock);
      root.classList.remove("locked");
      lock.remove();
    }, 900);
  }

  lock.addEventListener("click", function (e) {
    if (stage === "clock") showLogin();
  });
  enterBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    enter();
  });
  document.addEventListener("keydown", function (e) {
    if (stage === "clock") {
      e.preventDefault();
      showLogin();
    } else if (stage === "login" && e.key === "Escape") {
      enter();
    }
  });
})();
