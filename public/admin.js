const tokenEl = document.querySelector("#token"),
  statusEl = document.querySelector("#status"),
  queueView = document.querySelector("#queue-view"),
  termsView = document.querySelector("#terms-view");
tokenEl.value = sessionStorage.getItem("plainword-admin-token") || "";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
function auth() {
  const t = tokenEl.value.trim();
  if (!t) throw new Error("Admin-token saknas.");
  sessionStorage.setItem("plainword-admin-token", t);
  return { authorization: `Bearer ${t}` };
}
async function api(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { ...auth(), ...(opts.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
  return d;
}
function input(name, label, value = "", opts = "") {
  return `<label class="field"><span>${esc(label)}</span><input name="${name}" value="${esc(value)}" ${opts}></label>`;
}
function textarea(name, label, value = "", opts = "") {
  return `<label class="field full"><span>${esc(label)}</span><textarea name="${name}" rows="3" ${opts}>${esc(value)}</textarea></label>`;
}
function publicationFields(x = {}) {
  return `<div class="grid">${input("term", "Term *", x.term, 'required maxlength="200"')}${input("rattsomrade", "Rättsområde *", x.rattsomrade || x.foreslaget_rattsomrade || "Annat", 'required maxlength="100"')}${textarea("allmansprak", "Ordbokens/allmänspråkets betydelse *", x.allmansprak || x.foreslagen_vardagsbetydelse || "", 'required maxlength="4000"')}${input("sprak_kalla_namn", "Språkkälla — namn *", x.sprak_kalla_namn || "", 'required maxlength="300"')}${input("sprak_kalla_url", "Språkkälla — URL *", x.sprak_kalla_url || "", 'required type="url" maxlength="2000"')}${textarea("institution", "Institutionens användning *", x.institution || x.foreslagen_juridisk_definition || "", 'required maxlength="4000"')}${input("institution_kalla_namn", "Institutionell källa — namn *", x.institution_kalla_namn || "", 'required maxlength="300"')}${input("institution_kalla_url", "Institutionell källa — URL *", x.institution_kalla_url || "", 'required type="url" maxlength="2000"')}${textarea("skillnad", "Skillnaden *", x.skillnad || "", 'required maxlength="4000"')}${textarea("notering", "Notering", x.notering || x.foreslagen_exempel || "", 'maxlength="2000"')}</div>`;
}
function publicationFrom(card) {
  const data = {};
  for (const el of card.querySelectorAll(".publication [name]")) data[el.name] = el.value.trim();
  return data;
}
function validate(card) {
  for (const el of card.querySelectorAll(".publication [required]"))
    if (!el.reportValidity()) return false;
  return true;
}
function renderQueue(items) {
  if (!items.length) {
    queueView.innerHTML = '<div class="empty">Kön är tom.</div>';
    return;
  }
  queueView.innerHTML = items
    .map(
      (x) =>
        `<article class="card" data-submission-id="${esc(x.id)}"><h2>${esc(x.term)}</h2><div class="meta">#${esc(x.id)} · ${esc(x.created_at || "")}${x.reviewer_note ? ` · ${esc(x.reviewer_note)}` : ""}</div><div class="label">Inskickad allmänspråklig betydelse</div><div class="value">${esc(x.foreslagen_vardagsbetydelse || "")}</div><div class="label">Inskickad institutionell användning</div><div class="value">${esc(x.foreslagen_juridisk_definition || "")}</div><section class="publication"><h3>Publiceringspost</h3>${publicationFields(x)}</section><textarea class="note" placeholder="Intern granskningsanteckning" maxlength="2000"></textarea><div class="actions"><button class="btn primary" data-review="approve" type="button">Godkänn och publicera</button><button class="btn reject" data-review="reject" type="button">Avslå</button></div></article>`,
    )
    .join("");
}
function renderTerms(items) {
  if (!items.length) {
    termsView.innerHTML = '<div class="empty">Inga termposter.</div>';
    return;
  }
  termsView.innerHTML = items
    .map(
      (x) =>
        `<article class="card" data-term-id="${esc(x.id)}"><h2>${esc(x.term)} <span class="badge">${esc(x.status)}</span></h2><div class="meta">#${esc(x.id)} · publicerad ${esc(x.published_at || "")} · uppdaterad ${esc(x.updated_at || "")}</div><section class="publication">${publicationFields(x)}</section><div class="actions"><button class="btn primary" data-save type="button">Spara</button><button class="btn" data-status="${x.status === "published" ? "archived" : "published"}" type="button">${x.status === "published" ? "Arkivera" : "Återpublicera"}</button></div></article>`,
    )
    .join("");
}
async function loadAll() {
  statusEl.textContent = "Laddar…";
  try {
    const [q, t] = await Promise.all([api("/admin/api/queue"), api("/admin/api/terms")]);
    renderQueue(q.submissions || []);
    renderTerms(t.terms || []);
    statusEl.textContent = `${(q.submissions || []).length} väntande · ${(t.terms || []).length} termposter.`;
  } catch (e) {
    statusEl.textContent = e.message || String(e);
  }
}
queueView.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-review]");
  if (!b) return;
  const card = b.closest("[data-submission-id]"),
    action = b.dataset.review;
  if (action === "approve" && !validate(card)) return;
  b.disabled = true;
  try {
    const body = { action, note: card.querySelector(".note").value.trim() };
    if (action === "approve") body.publication = publicationFrom(card);
    await api(`/admin/api/review/${card.dataset.submissionId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    await loadAll();
  } catch (err) {
    statusEl.textContent = err.message || String(err);
    b.disabled = false;
  }
});
termsView.addEventListener("click", async (e) => {
  const card = e.target.closest("[data-term-id]");
  if (!card) return;
  const id = card.dataset.termId;
  try {
    if (e.target.closest("[data-save]")) {
      if (!validate(card)) return;
      await api(`/admin/api/terms/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publication: publicationFrom(card) }),
      });
    } else {
      const b = e.target.closest("[data-status]");
      if (!b) return;
      await api(`/admin/api/terms/${id}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: b.dataset.status }),
      });
    }
    await loadAll();
  } catch (err) {
    statusEl.textContent = err.message || String(err);
  }
});
document.querySelectorAll("[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("active", x === b));
    queueView.classList.toggle("hidden", b.dataset.tab !== "queue");
    termsView.classList.toggle("hidden", b.dataset.tab !== "terms");
  }),
);
document.querySelector("#load").addEventListener("click", loadAll);
tokenEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadAll();
});
