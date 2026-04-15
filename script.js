const screens = {
  start: document.querySelector("#screen-start"),
  quiz: document.querySelector("#screen-quiz"),
  result: document.querySelector("#screen-result")
};

const startBtn = document.querySelector("#start-btn");
const restartBtn = document.querySelector("#restart-btn");
const questionCounter = document.querySelector("#question-counter");
const progressBar = document.querySelector("#progress-bar");
const questionTitle = document.querySelector("#question-title");
const optionsList = document.querySelector("#options-list");
const resultProfile = document.querySelector("#result-profile");
const resultDescription = document.querySelector("#result-description");
const resultPotential = document.querySelector("#result-potential");
const resultRank = document.querySelector("#result-rank");
const rankFill = document.querySelector("#rank-fill");
const shareCopy = document.querySelector("#share-copy");
const shareButtons = document.querySelectorAll("[data-share]");
const confettiLayer = document.querySelector("#confetti-layer");

const ctaVariants = [
  { id: "A", copy: "Empezar" },
  { id: "B", copy: "Descubrir mi perfil millonario" },
  { id: "C", copy: "Hacer test de riqueza ahora" }
];

const questions = [
  {
    text: "Si recibes 10,000 EUR inesperados, que haces primero?",
    options: [
      { text: "Los invierto en una oportunidad que entiendo", profile: "investor", score: 18 },
      { text: "Monto algo propio para multiplicarlos", profile: "entrepreneur", score: 20 },
      { text: "Creo una estrategia a 3-5 anos con metas claras", profile: "visionary", score: 16 }
    ]
  },
  {
    text: "Cuando hay una crisis economica, tu reaccion es:",
    options: [
      { text: "Buscar activos en descuento", profile: "investor", score: 16 },
      { text: "Lanzar una solucion que la gente necesita", profile: "entrepreneur", score: 19 },
      { text: "Replantear mi plan para aprovechar el cambio", profile: "visionary", score: 17 }
    ]
  },
  {
    text: "Tu tolerancia al riesgo se parece mas a:",
    options: [
      { text: "Riesgo calculado con datos y control", profile: "investor", score: 15 },
      { text: "Apuesta fuerte si veo oportunidad grande", profile: "entrepreneur", score: 20 },
      { text: "Combino experimentos y vision de largo plazo", profile: "visionary", score: 17 }
    ]
  },
  {
    text: "Que habito te representa mejor?",
    options: [
      { text: "Sigo mercados y tendencias financieras", profile: "investor", score: 15 },
      { text: "Ejecuto ideas rapido sin esperar perfeccion", profile: "entrepreneur", score: 19 },
      { text: "Aprendo constantemente sobre negocios y liderazgo", profile: "visionary", score: 17 }
    ]
  },
  {
    text: "Tu objetivo principal con el dinero es:",
    options: [
      { text: "Crear patrimonio estable y creciente", profile: "investor", score: 16 },
      { text: "Escalar ingresos de forma agresiva", profile: "entrepreneur", score: 20 },
      { text: "Construir libertad y un impacto duradero", profile: "visionary", score: 18 }
    ]
  },
  {
    text: "En una semana productiva ideal, tu enfoque seria:",
    options: [
      { text: "Analizar numeros, retorno y oportunidades", profile: "investor", score: 15 },
      { text: "Cerrar ventas, alianzas y lanzar mejoras", profile: "entrepreneur", score: 18 },
      { text: "Disenar estrategia y mover al equipo", profile: "visionary", score: 17 }
    ]
  },
  {
    text: "Si tuvieras que multiplicar tus ingresos en 12 meses:",
    options: [
      { text: "Diversifico inversiones en instrumentos solidos", profile: "investor", score: 16 },
      { text: "Creo una oferta premium y la escalo", profile: "entrepreneur", score: 20 },
      { text: "Construyo un sistema de crecimiento sostenible", profile: "visionary", score: 18 }
    ]
  }
];

const profileConfig = {
  visionary: {
    name: "Visionario",
    description: "Ves oportunidades donde otros ven ruido. Tienes mentalidad de crecimiento y te enfocas en construir riqueza con estrategia.",
    potentialRange: [120000, 450000]
  },
  investor: {
    name: "Inversor inteligente",
    description: "Decides con cabeza fria y enfoque en rentabilidad. Tu disciplina financiera te permite crecer de forma consistente.",
    potentialRange: [90000, 380000]
  },
  entrepreneur: {
    name: "Emprendedor agresivo",
    description: "Tu energia y accion rapida te dan ventaja. Si mantienes foco y sistemas, puedes escalar ingresos de forma explosiva.",
    potentialRange: [150000, 700000]
  }
};

let questionIndex = 0;
let totalScore = 0;
const profilePoints = {
  visionary: 0,
  investor: 0,
  entrepreneur: 0
};

const scoreRange = {
  min: questions.length * 15,
  max: questions.length * 20
};

function trackEvent(eventName, params = {}) {
  const payload = { event: eventName, ...params };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, params);
  }

  if (window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track(eventName, params);
  }
}

function assignCtaVariant() {
  const storageKey = "moneytest_cta_variant";
  let selectedVariant = sessionStorage.getItem(storageKey);

  if (!selectedVariant) {
    const randomVariant = ctaVariants[Math.floor(Math.random() * ctaVariants.length)];
    selectedVariant = randomVariant.id;
    sessionStorage.setItem(storageKey, selectedVariant);
  }

  const variant = ctaVariants.find((item) => item.id === selectedVariant) || ctaVariants[0];
  startBtn.textContent = variant.copy;
  startBtn.setAttribute("data-variant", variant.id);
  trackEvent("ab_variant_assigned", { experiment: "start_cta_copy", variant: variant.id });
}

function showScreen(target) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("screen-active");
    screen.setAttribute("aria-hidden", "true");
  });

  screens[target].classList.add("screen-active");
  screens[target].setAttribute("aria-hidden", "false");
}

function renderQuestion() {
  const current = questions[questionIndex];
  const progress = ((questionIndex + 1) / questions.length) * 100;

  questionCounter.textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
  progressBar.style.width = `${progress}%`;
  questionTitle.textContent = current.text;
  optionsList.innerHTML = "";

  current.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "btn option-btn";
    button.textContent = option.text;
    button.addEventListener("click", () => selectOption(option));
    optionsList.appendChild(button);
  });
}

function selectOption(option) {
  totalScore += option.score;
  profilePoints[option.profile] += 1;

  trackEvent("quiz_answered", {
    question_number: questionIndex + 1,
    selected_profile: option.profile,
    selected_score: option.score
  });

  questionIndex += 1;

  if (questionIndex < questions.length) {
    renderQuestion();
    return;
  }

  showResult();
}

function calculateResultProfile() {
  const sortedProfiles = Object.entries(profilePoints).sort((a, b) => b[1] - a[1]);
  return sortedProfiles[0][0];
}

function estimatePotential(baseRange) {
  const bonus = Math.round(totalScore * 700);
  const min = baseRange[0] + Math.round(bonus * 0.35);
  const max = baseRange[1] + bonus;
  return `${formatCurrency(min)} - ${formatCurrency(max)} / ano`;
}

function calculateTopPercent() {
  const normalizedScore = (totalScore - scoreRange.min) / (scoreRange.max - scoreRange.min);
  const clamped = Math.min(1, Math.max(0, normalizedScore));
  return Math.max(3, Math.round(35 - clamped * 30));
}

function launchConfetti() {
  if (!confettiLayer) {
    return;
  }

  confettiLayer.innerHTML = "";
  const colors = ["#d4af37", "#18c47f", "#f5f5f5", "#ffe7a6"];

  for (let i = 0; i < 42; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.setProperty("--fall-duration", `${1300 + Math.random() * 1400}ms`);
    piece.style.animationDelay = `${Math.random() * 220}ms`;
    confettiLayer.appendChild(piece);
  }

  setTimeout(() => {
    confettiLayer.innerHTML = "";
  }, 3000);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function showResult() {
  const profileKey = calculateResultProfile();
  const profile = profileConfig[profileKey];
  const topPercent = calculateTopPercent();

  resultProfile.textContent = profile.name;
  resultDescription.textContent = profile.description;
  resultPotential.textContent = estimatePotential(profile.potentialRange);
  resultRank.textContent = `Top ${topPercent}% de mentalidad millonaria`;
  rankFill.style.width = `${Math.max(10, 100 - topPercent)}%`;

  const shareText = `Mira lo que me ha salido en MoneyTest: ${profile.name}. Hazlo tu tambien y descubre tu potencial 💸`;
  shareCopy.textContent = shareText;
  shareButtons.forEach((button) => {
    button.setAttribute("data-text", shareText);
  });

  launchConfetti();
  trackEvent("quiz_completed", { profile: profile.name, total_score: totalScore, top_percent: topPercent });
  trackEvent("result_viewed", { profile: profile.name, top_percent: topPercent });

  showScreen("result");
}

function resetQuiz() {
  questionIndex = 0;
  totalScore = 0;
  Object.keys(profilePoints).forEach((key) => {
    profilePoints[key] = 0;
  });
  progressBar.style.width = "0%";
}

async function shareAction(network, text) {
  const encodedText = encodeURIComponent(text);
  const siteUrl = encodeURIComponent(window.location.href);

  if (network === "whatsapp") {
    trackEvent("share_clicked", { network, action: "open_whatsapp" });
    window.open(`https://wa.me/?text=${encodedText}%20${siteUrl}`, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    trackEvent("share_clicked", { network, action: "copy_success" });
    alert(`Texto copiado para compartir en ${network}.`);
  } catch {
    trackEvent("share_clicked", { network, action: "copy_fail" });
    alert("No se pudo copiar automaticamente. Copialo manualmente desde pantalla.");
  }
}

startBtn.addEventListener("click", () => {
  const variantId = startBtn.getAttribute("data-variant") || "A";
  trackEvent("quiz_started", { source: "start_button", variant: variantId });
  resetQuiz();
  showScreen("quiz");
  renderQuestion();
});

restartBtn.addEventListener("click", () => {
  trackEvent("quiz_restarted");
  showScreen("start");
});

shareButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const network = button.getAttribute("data-share");
    const text = button.getAttribute("data-text") || "Mira lo que me ha salido, hazlo tu";
    shareAction(network, text);
  });
});

assignCtaVariant();
