// DB 암호화 체험 (career.html)
// 브라우저 내장 Web Crypto(AES-GCM 256비트)로 암호화하고, 결과는 화면에만 표시한다.
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("encForm");
  if (!form) return;

  const result = document.getElementById("encResult");
  const rows = document.getElementById("encRows");
  const note = document.getElementById("encNote");
  const decryptBtn = document.getElementById("encDecrypt");
  const benchBtn = document.getElementById("encBench");
  const benchOut = document.getElementById("encBenchOut");
  const subtle = window.crypto && window.crypto.subtle;

  if (!subtle) {
    note.hidden = false;
    note.textContent = "이 브라우저에서는 암호화 기능(Web Crypto)을 쓸 수 없습니다. 최신 브라우저의 https 주소에서 열어 주세요.";
    form.querySelector("button[type=submit]").disabled = true;
    benchBtn.disabled = true;
    return;
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let key = null;
  let stored = [];   // { label, iv, cipher, plain }
  let decrypted = false;

  function getKey() {
    if (key) return Promise.resolve(key);
    return subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])
      .then(function (k) { key = k; return k; });
  }

  function toBase64(buf) {
    let s = "";
    new Uint8Array(buf).forEach(function (b) { s += String.fromCharCode(b); });
    return btoa(s);
  }

  // 마스킹 규칙: 이름은 가운데, 주민번호는 뒷자리 첫 글자 이후, 주소는 시·구 단위까지만
  function maskName(v) {
    const c = Array.from(v);
    if (c.length <= 1) return "*";
    if (c.length === 2) return c[0] + "*";
    return c[0] + "*".repeat(c.length - 2) + c[c.length - 1];
  }
  function maskRrn(v) {
    const d = v.replace(/[^0-9]/g, "");
    if (d.length < 7) return "*".repeat(v.length);
    return d.slice(0, 6) + "-" + d[6] + "******";
  }
  function maskAddr(v) {
    const parts = v.trim().split(/\s+/);
    return parts.slice(0, 2).join(" ") + (parts.length > 2 ? " ***" : "");
  }

  function cell(text, cls) {
    const td = document.createElement("td");
    if (cls) td.className = cls;
    td.textContent = text;   // innerHTML을 쓰지 않아 입력값이 코드로 실행되지 않음
    return td;
  }

  function render() {
    rows.innerHTML = "";
    stored.forEach(function (r) {
      const tr = document.createElement("tr");
      tr.appendChild(cell(r.label));
      tr.appendChild(cell(decrypted ? r.plain : r.cipher, decrypted ? "plain" : "cipher"));
      tr.appendChild(cell(r.mask));
      rows.appendChild(tr);
    });
    result.hidden = false;
    note.hidden = false;
    note.textContent = decrypted
      ? "권한 있는 사용자가 키로 복호화하면 원래 값을 볼 수 있습니다. 키가 없는 사람에게는 위 암호문만 보입니다."
      : "DB가 유출돼도 암호문만 남아 원래 값을 알 수 없습니다. 같은 값이라도 누를 때마다 암호문이 달라집니다(무작위 IV).";
    decryptBtn.textContent = decrypted ? "다시 암호문 보기" : "권한자 복호화";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const fields = [
      { label: "이름", value: form.elements["name"].value.trim(), mask: maskName },
      { label: "주민등록번호", value: form.elements["rrn"].value.trim(), mask: maskRrn },
      { label: "주소", value: form.elements["addr"].value.trim(), mask: maskAddr }
    ];
    if (fields.some(function (f) { return !f.value; })) {
      note.hidden = false;
      note.textContent = "세 칸을 모두 입력해 주세요.";
      return;
    }
    getKey().then(function (k) {
      return Promise.all(fields.map(function (f) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        return subtle.encrypt({ name: "AES-GCM", iv: iv }, k, enc.encode(f.value)).then(function (buf) {
          return { label: f.label, iv: iv, buf: buf, cipher: toBase64(buf), plain: "", mask: f.mask(f.value) };
        });
      }));
    }).then(function (list) {
      stored = list;
      decrypted = false;
      decryptBtn.disabled = false;
      render();
    });
  });

  decryptBtn.addEventListener("click", function () {
    if (decrypted) {
      decrypted = false;
      render();
      return;
    }
    Promise.all(stored.map(function (r) {
      return subtle.decrypt({ name: "AES-GCM", iv: r.iv }, key, r.buf).then(function (buf) {
        r.plain = dec.decode(buf);
      });
    })).then(function () {
      decrypted = true;
      render();
    });
  });

  // 성능 테스트: 주민번호 형태의 값 1만 건을 암호화하는 데 걸리는 시간
  benchBtn.addEventListener("click", function () {
    benchBtn.disabled = true;
    benchOut.textContent = "측정 중…";
    const N = 10000;
    const data = enc.encode("900101-1234567");
    getKey().then(function (k) {
      const t0 = performance.now();
      const jobs = [];
      for (let i = 0; i < N; i++) {
        jobs.push(subtle.encrypt({ name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) }, k, data));
      }
      return Promise.all(jobs).then(function () { return performance.now() - t0; });
    }).then(function (ms) {
      const per = (ms * 1000) / N;
      benchOut.textContent = "1만 건 " + Math.round(ms).toLocaleString() + "ms · 건당 약 " + per.toFixed(1) + "µs (이 기기 기준)";
      benchBtn.disabled = false;
    });
  });
});
