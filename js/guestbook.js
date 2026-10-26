// 방명록 (guestbook.html): Supabase REST API로 글을 읽고 쓴다.
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("gbForm");
  if (!form) return;

  const list = document.getElementById("gbList");
  const status = document.getElementById("gbStatus");
  const count = document.getElementById("gbCount");
  const submit = document.getElementById("gbSubmit");
  const nameInput = form.elements["name"];
  const msgInput = form.elements["message"];
  const trap = form.elements["website"];

  const cfg = window.GUESTBOOK_CONFIG || {};
  const ready = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.url || "") && cfg.anonKey;
  const endpoint = (cfg.url || "") + "/rest/v1/guestbook";
  const COOLDOWN = 30 * 1000;
  const NAME_MAX = 20;
  const MSG_MAX = 300;

  function headers(extra) {
    const h = { apikey: cfg.anonKey };
    // 예전 형식(JWT) anon 키만 Authorization에도 넣는다. 새 publishable 키는 apikey 헤더만 쓴다.
    if (cfg.anonKey.indexOf("eyJ") === 0) h.Authorization = "Bearer " + cfg.anonKey;
    for (const k in extra) h[k] = extra[k];
    return h;
  }

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "gb-status" + (kind ? " is-" + kind : "");
  }

  function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "방금 전";
    if (diff < 3600) return Math.floor(diff / 60) + "분 전";
    if (diff < 86400) return Math.floor(diff / 3600) + "시간 전";
    if (diff < 86400 * 7) return Math.floor(diff / 86400) + "일 전";
    const d = new Date(iso);
    return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
  }

  // 글은 textContent로만 넣는다: 내용에 HTML이나 스크립트가 있어도 글자로만 보인다 (XSS 방어)
  function item(entry) {
    const li = document.createElement("li");
    li.className = "gb-item";
    const head = document.createElement("div");
    head.className = "gb-head";
    const avatar = document.createElement("span");
    avatar.className = "gb-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = Array.from(entry.name)[0] || "?";
    const name = document.createElement("strong");
    name.textContent = entry.name;
    const time = document.createElement("time");
    time.dateTime = entry.created_at;
    time.textContent = timeAgo(entry.created_at);
    head.append(avatar, name, time);
    const body = document.createElement("p");
    body.textContent = entry.message;
    li.append(head, body);
    return li;
  }

  function renderEmpty(text) {
    list.innerHTML = "";
    const li = document.createElement("li");
    li.className = "gb-empty";
    li.textContent = text;
    list.appendChild(li);
  }

  function load() {
    fetch(endpoint + "?select=id,name,message,created_at&order=created_at.desc&limit=50", { headers: headers() })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (rows) {
        if (!rows.length) {
          renderEmpty("아직 글이 없습니다. 첫 번째 글을 남겨 주세요!");
          return;
        }
        list.innerHTML = "";
        rows.forEach(function (row) { list.appendChild(item(row)); });
      })
      .catch(function () {
        renderEmpty("글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      });
  }

  msgInput.addEventListener("input", function () {
    count.textContent = Array.from(msgInput.value).length + " / " + MSG_MAX;
  });

  if (!ready) {
    Array.from(form.elements).forEach(function (el) { el.disabled = true; });
    setStatus("방명록을 준비하고 있습니다. 곧 글을 남길 수 있어요.", "info");
    renderEmpty("방명록 준비 중입니다.");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = msgInput.value.trim();

    if (trap.value) {
      // 봇이 숨은 칸을 채운 경우: 저장하지 않고 조용히 끝낸다
      form.reset();
      return;
    }
    if (!name || !message) {
      setStatus("이름과 내용을 모두 입력해 주세요.", "error");
      return;
    }
    if (Array.from(name).length > NAME_MAX || Array.from(message).length > MSG_MAX) {
      setStatus("이름은 20자, 내용은 300자까지 쓸 수 있습니다.", "error");
      return;
    }
    let last = 0;
    try { last = Number(localStorage.getItem("gb-last")) || 0; } catch (err) {}
    const wait = COOLDOWN - (Date.now() - last);
    if (wait > 0) {
      setStatus(Math.ceil(wait / 1000) + "초 뒤에 다시 남길 수 있습니다.", "error");
      return;
    }

    submit.disabled = true;
    setStatus("저장하는 중…");
    fetch(endpoint, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify({ name: name, message: message })
    })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (rows) {
        try { localStorage.setItem("gb-last", String(Date.now())); } catch (err) {}
        form.reset();
        count.textContent = "0 / " + MSG_MAX;
        setStatus("남겨 주셔서 감사합니다!", "ok");
        const empty = list.querySelector(".gb-empty");
        if (empty) empty.remove();
        if (rows && rows[0]) list.prepend(item(rows[0]));
      })
      .catch(function () {
        setStatus("저장하지 못했습니다. 글이 너무 많이 몰렸을 수 있어요. 잠시 후 다시 시도해 주세요.", "error");
      })
      .finally(function () {
        submit.disabled = false;
      });
  });

  load();
});
