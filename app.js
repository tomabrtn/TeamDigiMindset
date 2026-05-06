const STORAGE_KEY = "trend-backlog-ai-radar:v1";

const stages = ["Nove", "Overit", "Sledovat", "Akce", "Archiv"];

const demoSignals = [
  {
    id: "sig-001",
    title: "Zakaznici se ptaji na self-service reporting",
    source: "obchodni schuzky SME",
    category: "Zakaznici",
    horizon: "0-3 mesice",
    impact: 4,
    confidence: 4,
    stage: "Overit",
    description:
      "Tri nezavisli zakaznici chteli exporty, vlastni dashboardy a mene manualnich dotazu na account tym.",
    tags: ["self-service", "reporting", "SME"],
    createdAt: "2026-05-01T09:00:00.000Z",
  },
  {
    id: "sig-002",
    title: "Konkurence testuje AI asistenta pro onboarding",
    source: "partner channel",
    category: "Konkurence",
    horizon: "3-12 mesicu",
    impact: 5,
    confidence: 3,
    stage: "Sledovat",
    description:
      "Partner zminil pilot, kde konkurencni tym zkracuje onboarding klientu pomoci asistenta pro navody a kontrolu vstupu.",
    tags: ["AI", "onboarding", "konkurence"],
    createdAt: "2026-04-28T14:20:00.000Z",
  },
  {
    id: "sig-003",
    title: "Regulacni tlak na auditovatelnost automatizace",
    source: "oborova konference",
    category: "Regulace",
    horizon: "12+ mesicu",
    impact: 4,
    confidence: 5,
    stage: "Sledovat",
    description:
      "Diskuse regulatoru smeruje k tomu, aby digitalni rozhodovaci procesy mely auditni stopu, vysvetlitelnost a jasne vlastnictvi.",
    tags: ["audit", "automatizace", "governance"],
    createdAt: "2026-04-20T11:45:00.000Z",
  },
  {
    id: "sig-004",
    title: "Partneri tlaci na jednodussi integracni checklist",
    source: "partnersky workshop",
    category: "Partneri",
    horizon: "0-3 mesice",
    impact: 3,
    confidence: 4,
    stage: "Akce",
    description:
      "Implementacni partneri opakovane narazeji na stejne nejasnosti v datovem mapovani a potrebovali by standardizovany checklist.",
    tags: ["integrace", "partneri", "checklist"],
    createdAt: "2026-04-24T08:15:00.000Z",
  },
  {
    id: "sig-005",
    title: "Interni tymy hledaji priklady dobre AI praxe",
    source: "digital champions komunita",
    category: "Operativa",
    horizon: "3-12 mesicu",
    impact: 3,
    confidence: 5,
    stage: "Nove",
    description:
      "Lide nechteji dalsi obecne skoleni. Vice rezonuje sdileni konkretnich ukazek, sablon promptu a kratkych retrospektiv.",
    tags: ["mindset", "AI adopce", "playbook"],
    createdAt: "2026-05-03T16:30:00.000Z",
  },
];

let signals = loadSignals();
let filters = {
  search: "",
  category: "all",
  horizon: "all",
  priorityOnly: false,
};

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  viewButtons: document.querySelectorAll("[data-view-target]"),
  views: {
    radar: document.querySelector("#radarView"),
    backlog: document.querySelector("#backlogView"),
    submit: document.querySelector("#submitView"),
    briefing: document.querySelector("#briefingView"),
  },
  search: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  horizonFilter: document.querySelector("#horizonFilter"),
  priorityOnly: document.querySelector("#priorityOnly"),
  metrics: {
    active: document.querySelector("#metricActive"),
    priority: document.querySelector("#metricPriority"),
    confidence: document.querySelector("#metricConfidence"),
    act: document.querySelector("#metricAct"),
  },
  matrix: document.querySelector("#matrix"),
  radarCount: document.querySelector("#radarCount"),
  aiSummary: document.querySelector("#aiSummary"),
  kanban: document.querySelector("#kanban"),
  form: document.querySelector("#signalForm"),
  livePreview: document.querySelector("#livePreview"),
  briefing: document.querySelector("#briefingOutput"),
  copyBriefing: document.querySelector("#copyBriefing"),
  seedButton: document.querySelector("#seedButton"),
  dialog: document.querySelector("#detailDialog"),
  detailContent: document.querySelector("#detailContent"),
  closeDialog: document.querySelector(".close-dialog"),
};

function loadSignals() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return demoSignals;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : demoSignals;
  } catch {
    return demoSignals;
  }
}

function saveSignals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
}

function analyzeSignal(signal) {
  const text = `${signal.title} ${signal.description} ${signal.tags.join(" ")}`.toLowerCase();
  const urgency = signal.horizon === "0-3 mesice" ? 1.15 : signal.horizon === "3-12 mesicu" ? 1 : 0.82;
  const score = Math.min(100, Math.round((signal.impact * 13 + signal.confidence * 9) * urgency));
  const highRisk = signal.category === "Regulace" || text.includes("konkurenc");
  const aiTheme = text.includes("ai") || text.includes("automat") ? "AI adopce a provozni zmena" : "digitalni zkusenost";
  const customerTheme = text.includes("zakaz") || signal.category === "Zakaznici";

  return {
    score,
    priority: score >= 72 ? "high" : score >= 50 ? "medium" : "low",
    strategicSignal: customerTheme
      ? "Signal ukazuje na tlak trhu smerem k rychlejsi, samostatnejsi a transparentnejsi digitalni obsluze."
      : `Signal patri do oblasti ${aiTheme} a muze ovlivnit pozici tymu v pristich rozhodnutich.`,
    opportunity:
      signal.impact >= 4
        ? "Vytvorit maly validacni experiment s jasnym vlastnikem, metrikou a terminem vyhodnoceni."
        : "Zachytit opakovani v dalsich zdrojich a doplnit signal o konkretni obchodni nebo provozni dopad.",
    risk: highRisk
      ? "Pokud tym zareaguje pozde, muze prijit o narativ, duveru nebo schopnost prokazat kontrolu nad zmenou."
      : "Nejvetsi riziko je preceneni jednoho zdroje bez dalsi validace a bez navazani na rozhodovaci rytmus.",
    devil:
      signal.confidence <= 3
        ? "Co kdyz jde jen o hlasity jednotlivy pripad a realny segmentovy dopad je zatim nizky?"
        : "Co by muselo byt pravda, aby tento signal nebyl strategicky dulezity?",
    nextAction:
      score >= 72
        ? "Pripravit rozhodovaci one-pager a zaradit do nejblizsi leadership diskuse."
        : score >= 50
          ? "Doplnit dva nezavisle zdroje a definovat, co by signal posunulo do akce."
          : "Ponechat ve sledovani a vratit se k nemu pri dalsim podobnem vstupu.",
  };
}

function getFilteredSignals() {
  return signals
    .filter((signal) => signal.stage !== "Archiv")
    .filter((signal) => {
      const searchable = `${signal.title} ${signal.source} ${signal.category} ${signal.description} ${signal.tags.join(" ")}`.toLowerCase();
      const matchesSearch = searchable.includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === "all" || signal.category === filters.category;
      const matchesHorizon = filters.horizon === "all" || signal.horizon === filters.horizon;
      const matchesPriority = !filters.priorityOnly || analyzeSignal(signal).priority === "high";
      return matchesSearch && matchesCategory && matchesHorizon && matchesPriority;
    })
    .sort((a, b) => analyzeSignal(b).score - analyzeSignal(a).score);
}

function renderCategoryOptions() {
  const categories = [...new Set(signals.map((signal) => signal.category))].sort((a, b) => a.localeCompare(b, "cs"));
  elements.categoryFilter.innerHTML = `<option value="all">Vse</option>${categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("")}`;
  elements.categoryFilter.value = filters.category;
}

function renderMetrics(filtered) {
  const active = signals.filter((signal) => signal.stage !== "Archiv");
  const priority = active.filter((signal) => analyzeSignal(signal).priority === "high");
  const confidence = active.length
    ? Math.round((active.reduce((sum, signal) => sum + signal.confidence, 0) / (active.length * 5)) * 100)
    : 0;

  elements.metrics.active.textContent = active.length;
  elements.metrics.priority.textContent = priority.length;
  elements.metrics.confidence.textContent = `${confidence}%`;
  elements.metrics.act.textContent = active.filter((signal) => signal.stage === "Akce").length;
  elements.radarCount.textContent = `${filtered.length} zobrazeno`;
}

function renderMatrix(filtered) {
  elements.matrix.querySelectorAll(".radar-dot").forEach((dot) => dot.remove());

  filtered.forEach((signal, index) => {
    const analysis = analyzeSignal(signal);
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `radar-dot ${analysis.priority}`;
    dot.style.left = `${12 + (signal.confidence - 1) * 21 + (index % 3) * 2}%`;
    dot.style.bottom = `${12 + (signal.impact - 1) * 21 + (index % 2) * 3}%`;
    dot.dataset.label = `${signal.title} (${analysis.score})`;
    dot.title = signal.title;
    dot.addEventListener("click", () => openDetail(signal.id));
    elements.matrix.appendChild(dot);
  });
}

function renderAiSummary(filtered) {
  if (!filtered.length) {
    elements.aiSummary.innerHTML = `<div class="empty-state">Filtry nevraci zadne aktivni signaly.</div>`;
    return;
  }

  const top = filtered[0];
  const analysis = analyzeSignal(top);
  const categoryCounts = countBy(filtered, "category");
  const strongestCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "bez kategorie";
  const highPriority = filtered.filter((signal) => analyzeSignal(signal).priority === "high").length;

  elements.aiSummary.innerHTML = `
    ${insightBlock("Nejsilnejsi signal", `${escapeHtml(top.title)} ma skore ${analysis.score}/100 a patri do faze ${escapeHtml(top.stage)}.`)}
    ${insightBlock("Vzorec v datech", `Nejcasteji se objevuje oblast ${escapeHtml(strongestCategory)}. Vysokou prioritu maji ${highPriority} aktivni signaly.`)}
    ${insightBlock("Dabeluv advokat", analysis.devil, "risk")}
    ${insightBlock("Doporuceny dalsi krok", analysis.nextAction, "action")}
  `;
}

function renderKanban(filtered) {
  elements.kanban.innerHTML = stages
    .map((stage) => {
      const stageSignals = filteredStageSignals(stage, filtered);
      return `
        <section class="kanban-column">
          <div class="column-title">${stage}<span>${stageSignals.length}</span></div>
          <div class="card-list">
            ${stageSignals.map(renderCard).join("") || `<div class="empty-state">Zadne signaly</div>`}
          </div>
        </section>
      `;
    })
    .join("");

  elements.kanban.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => openDetail(button.dataset.open));
  });

  elements.kanban.querySelectorAll("[data-stage]").forEach((select) => {
    select.addEventListener("change", () => {
      const signal = signals.find((item) => item.id === select.dataset.stage);
      if (!signal) return;
      signal.stage = select.value;
      saveSignals();
      render();
    });
  });
}

function filteredStageSignals(stage, filtered) {
  if (stage === "Archiv") {
    return signals.filter((signal) => signal.stage === "Archiv");
  }

  const visibleIds = new Set(filtered.map((signal) => signal.id));
  return signals
    .filter((signal) => signal.stage === stage && visibleIds.has(signal.id))
    .sort((a, b) => analyzeSignal(b).score - analyzeSignal(a).score);
}

function renderCard(signal) {
  const analysis = analyzeSignal(signal);
  return `
    <article class="trend-card">
      <button type="button" data-open="${signal.id}">
        <h3>${escapeHtml(signal.title)}</h3>
        <p>${escapeHtml(signal.description)}</p>
      </button>
      <div class="card-meta">
        <span class="status-pill">${escapeHtml(signal.category)}</span>
        <span class="status-pill">${escapeHtml(signal.horizon)}</span>
        <span class="score">${analysis.score}/100</span>
      </div>
      <select class="stage-select" data-stage="${signal.id}" aria-label="Zmenit fazi">
        ${stages.map((stage) => `<option ${stage === signal.stage ? "selected" : ""}>${stage}</option>`).join("")}
      </select>
    </article>
  `;
}

function renderBriefing(filtered) {
  const topSignals = filtered.slice(0, 5);
  const actionSignals = signals.filter((signal) => signal.stage === "Akce");
  const watchSignals = signals.filter((signal) => signal.stage === "Sledovat");

  elements.briefing.innerHTML = `
    <div>
      <h3>Top temata</h3>
      <ul>${topSignals.map((signal) => `<li><strong>${escapeHtml(signal.title)}</strong>: ${escapeHtml(analyzeSignal(signal).nextAction)}</li>`).join("")}</ul>
    </div>
    <div>
      <h3>Rozhodnuti pro tym</h3>
      <ul>
        <li>Potvrdit vlastnika pro ${actionSignals.length || 1} signal(y) ve fazi Akce.</li>
        <li>Vybrat, ktere signaly ze sledovani maji dostat dalsi validacni zdroj: ${watchSignals.length} kandidatu.</li>
        <li>Zachytit protiargumenty pred investici do velkych zmen.</li>
      </ul>
    </div>
  `;
}

function renderLivePreview() {
  const data = getFormData();
  if (!data.title && !data.description) {
    elements.livePreview.className = "ai-summary empty-state";
    elements.livePreview.textContent = "Vyplnte signal a nahled se prubezne prepocita.";
    return;
  }

  const analysis = analyzeSignal({
    ...data,
    title: data.title || "Rozpracovany signal",
    description: data.description || "",
    tags: data.tags,
  });

  elements.livePreview.className = "ai-summary";
  elements.livePreview.innerHTML = `
    ${insightBlock("Strategicky signal", analysis.strategicSignal)}
    ${insightBlock("Prilezitost", analysis.opportunity)}
    ${insightBlock("Riziko", analysis.risk, "risk")}
    ${insightBlock("Dalsi krok", analysis.nextAction, "action")}
  `;
}

function openDetail(id) {
  const signal = signals.find((item) => item.id === id);
  if (!signal) return;
  const analysis = analyzeSignal(signal);

  elements.detailContent.innerHTML = `
    <p class="eyebrow">${escapeHtml(signal.category)} / ${escapeHtml(signal.source)}</p>
    <h2>${escapeHtml(signal.title)}</h2>
    <p>${escapeHtml(signal.description)}</p>
    <div class="detail-grid">
      ${detailStat("Skore", `${analysis.score}/100`)}
      ${detailStat("Dopad", `${signal.impact}/5`)}
      ${detailStat("Duvera", `${signal.confidence}/5`)}
      ${detailStat("Horizont", signal.horizon)}
    </div>
    <div class="tag-row">${signal.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
    <div class="ai-summary">
      ${insightBlock("Strategicky signal", analysis.strategicSignal)}
      ${insightBlock("Prilezitost", analysis.opportunity)}
      ${insightBlock("Riziko", analysis.risk, "risk")}
      ${insightBlock("Dabeluv advokat", analysis.devil, "risk")}
      ${insightBlock("Dalsi krok", analysis.nextAction, "action")}
    </div>
  `;
  elements.dialog.showModal();
}

function detailStat(label, value) {
  return `<div class="detail-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function insightBlock(title, body, type = "") {
  return `<div class="insight-block ${type}"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
}

function getFormData() {
  const formData = new FormData(elements.form);
  return {
    title: String(formData.get("title") || "").trim(),
    source: String(formData.get("source") || "").trim(),
    category: String(formData.get("category") || "Zakaznici"),
    horizon: String(formData.get("horizon") || "0-3 mesice"),
    impact: Number(formData.get("impact") || 3),
    confidence: Number(formData.get("confidence") || 3),
    description: String(formData.get("description") || "").trim(),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function switchView(viewName) {
  Object.entries(elements.views).forEach(([name, view]) => {
    view.classList.toggle("is-active", name === viewName);
  });
  elements.navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewName);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  renderCategoryOptions();
  const filtered = getFilteredSignals();
  renderMetrics(filtered);
  renderMatrix(filtered);
  renderAiSummary(filtered);
  renderKanban(filtered);
  renderBriefing(filtered);
}

elements.navItems.forEach((item) => {
  item.addEventListener("click", () => switchView(item.dataset.view));
});

elements.viewButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
});

elements.search.addEventListener("input", () => {
  filters.search = elements.search.value;
  render();
});

elements.categoryFilter.addEventListener("change", () => {
  filters.category = elements.categoryFilter.value;
  render();
});

elements.horizonFilter.addEventListener("change", () => {
  filters.horizon = elements.horizonFilter.value;
  render();
});

elements.priorityOnly.addEventListener("change", () => {
  filters.priorityOnly = elements.priorityOnly.checked;
  render();
});

elements.form.addEventListener("input", renderLivePreview);

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = getFormData();
  const nextSignal = {
    id: `sig-${crypto.randomUUID()}`,
    ...data,
    tags: data.tags.length ? data.tags : [data.category.toLowerCase()],
    stage: "Nove",
    createdAt: new Date().toISOString(),
  };

  signals = [nextSignal, ...signals];
  saveSignals();
  elements.form.reset();
  renderLivePreview();
  render();
  switchView("backlog");
});

elements.copyBriefing.addEventListener("click", async () => {
  const text = elements.briefing.innerText;
  await navigator.clipboard.writeText(text);
  elements.copyBriefing.textContent = "Zkopirovano";
  setTimeout(() => {
    elements.copyBriefing.textContent = "Kopirovat briefing";
  }, 1600);
});

elements.seedButton.addEventListener("click", () => {
  signals = demoSignals;
  saveSignals();
  filters = { search: "", category: "all", horizon: "all", priorityOnly: false };
  elements.search.value = "";
  elements.horizonFilter.value = "all";
  elements.priorityOnly.checked = false;
  render();
});

elements.closeDialog.addEventListener("click", () => elements.dialog.close());
elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

renderLivePreview();
render();
