const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const list = document.querySelector("#list"),
  count = document.querySelector("#count"),
  search = document.querySelector("#search"),
  filters = document.querySelector("#filters");
let TERMS = [],
  activeArea = "Alla";
function areas() {
  return ["Alla", ...new Set(TERMS.map((t) => t.rattsomrade || "Annat"))];
}
function renderFilters() {
  filters.innerHTML = areas()
    .map(
      (a) =>
        `<button class="filter ${a === activeArea ? "active" : ""}" type="button" data-area="${escapeHtml(a)}">${escapeHtml(a)}</button>`,
    )
    .join("");
}
function sourceLink(source) {
  return source?.url
    ? `<a class="source-link" href="${escapeHtml(source.url)}" rel="noopener noreferrer" target="_blank">Källa: ${escapeHtml(source.namn)} ↗</a>`
    : "";
}
function render() {
  const q = search.value.trim().toLocaleLowerCase("sv");
  const items = TERMS.filter(
    (t) =>
      (activeArea === "Alla" || (t.rattsomrade || "Annat") === activeArea) &&
      (!q || JSON.stringify(t).toLocaleLowerCase("sv").includes(q)),
  );
  count.textContent = `${items.length} av ${TERMS.length} publicerade poster`;
  if (!items.length) {
    list.innerHTML = '<div class="empty">Ingen post matchar sökningen.</div>';
    return;
  }
  list.innerHTML = items
    .map(
      (t) =>
        `<article class="card"><div class="card-head"><h2 class="term">${escapeHtml(t.term)}</h2><span class="area">${escapeHtml(t.rattsomrade || "Annat")}</span></div><div class="compare"><section class="panel ordinary"><div class="label">Ordbokens betydelse</div><p>${escapeHtml(t.allmansprak)}</p>${sourceLink(t.sprakKalla)}</section><section class="panel institution"><div class="label">Institutionens användning</div><p>${escapeHtml(t.institution)}</p>${sourceLink(t.institutionKalla)}</section></div>${t.skillnad ? `<div class="difference"><strong>Skillnaden:</strong> ${escapeHtml(t.skillnad)}</div>` : ""}${t.not || t.kallorOchExempel ? `<div class="note">${escapeHtml(t.not || t.kallorOchExempel)}</div>` : ""}</article>`,
    )
    .join("");
}
function populateAreas() {
  const current = areaSelect.value;
  areaSelect.innerHTML = '<option value="">Vet ej / annat</option>';
  for (const a of areas().filter((a) => a !== "Alla")) {
    const o = document.createElement("option");
    o.value = a;
    o.textContent = a;
    areaSelect.append(o);
  }
  areaSelect.value = current;
}
async function loadTerms() {
  list.innerHTML = '<div class="empty">Laddar publicerade termer…</div>';
  try {
    const r = await fetch("/api/terms", { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    TERMS = (data.terms || []).filter((t) => t.term && t.allmansprak && t.institution);
    renderFilters();
    render();
    populateAreas();
  } catch (err) {
    console.error("Kunde inte läsa publicerade D1-termer", err);
    count.textContent = "";
    list.innerHTML =
      '<div class="empty">Kunde inte läsa de publicerade termerna. Försök igen senare.</div>';
    renderFilters();
    populateAreas();
  }
}
filters.addEventListener("click", (e) => {
  const b = e.target.closest("[data-area]");
  if (!b) return;
  activeArea = b.dataset.area;
  renderFilters();
  render();
});
search.addEventListener("input", render);
const dialog = document.querySelector("#proposal-dialog"),
  form = document.querySelector("#proposal-form"),
  formMessage = document.querySelector("#form-message"),
  areaSelect = document.querySelector("#area-select");
document.querySelector("#suggest").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancel").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMessage.hidden = true;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.turnstileToken = payload["cf-turnstile-response"];
  delete payload["cf-turnstile-response"];
  try {
    const r = await fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    form.reset();
    if (window.turnstile) window.turnstile.reset();
    formMessage.textContent =
      "Tack. Förslaget ligger i granskningskön. Om det godkänns blir det publikt automatiskt.";
    formMessage.hidden = false;
  } catch (err) {
    formMessage.textContent = err instanceof Error ? err.message : "Kunde inte skicka förslaget.";
    formMessage.hidden = false;
  }
});
loadTerms();
