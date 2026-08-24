const STORAGE_KEY = "toddlerMealPlanner.v1";

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.recipes && parsed.plans) return parsed;
    } catch (e) { /* fall through to defaults */ }
  }
  return { recipes: SEED_RECIPES.slice(), plans: {} };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let currentDate = new Date();
let currentWeekStart = startOfWeek(new Date());

// ---------- date helpers ----------
function toKey(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function startOfWeek(d) {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // start Monday
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}
function fmtLong(d) {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function fmtShort(d) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// ---------- recipe lookup ----------
function recipesByCategory(cat) {
  return state.recipes.filter(r => r.category === cat);
}
function getRecipe(id) {
  return state.recipes.find(r => r.id === id);
}

// ---------- plan generation ----------
function recentlyUsedIds(beforeDate, category, lookbackDays = 4) {
  const used = new Set();
  for (let i = 1; i <= lookbackDays; i++) {
    const key = toKey(addDays(beforeDate, -i));
    const plan = state.plans[key];
    if (plan && plan[category]) used.add(plan[category]);
  }
  return used;
}
// Weekdays show breakfast + dinner only; weekends show all four slots.
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}
function slotsForDate(date) {
  return isWeekend(date) ? MEAL_SLOTS : MEAL_SLOTS.filter(s => s.key === "breakfast" || s.key === "dinner");
}
// On weekdays, lunch recipes double as dinner options too (lunch itself isn't served that day).
function poolForSlot(date, category) {
  let pool = recipesByCategory(category);
  if (category === "dinner" && !isWeekend(date)) {
    pool = pool.concat(recipesByCategory("lunch"));
  }
  return pool.filter(r => r.pref !== "dislike");
}
function pickForSlot(date, category) {
  const pool = poolForSlot(date, category);
  if (pool.length === 0) return null;
  const used = recentlyUsedIds(date, category);
  let candidates = pool.filter(r => !used.has(r.id));
  if (candidates.length === 0) candidates = pool;
  const weighted = [];
  candidates.forEach(r => {
    const weight = r.pref === "like" ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(r.id);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}
function generateDay(date, force = false) {
  const key = toKey(date);
  if (!force && state.plans[key]) return state.plans[key];
  const dayPlan = {};
  slotsForDate(date).forEach(slot => {
    dayPlan[slot.key] = pickForSlot(date, slot.key);
  });
  state.plans[key] = dayPlan;
  saveState();
  return dayPlan;
}
function ensureWeekGenerated(weekStart) {
  for (let i = 0; i < 7; i++) {
    generateDay(addDays(weekStart, i), false);
  }
}

// ---------- rendering: Today view ----------
function renderToday() {
  const dateEl = document.getElementById("today-date");
  dateEl.innerHTML = `${fmtLong(currentDate)}`;
  const plan = generateDay(currentDate, false);
  const container = document.getElementById("today-meals");
  container.innerHTML = "";
  slotsForDate(currentDate).forEach(slot => {
    const recipeId = plan[slot.key];
    const recipe = getRecipe(recipeId);
    const row = document.createElement("div");
    row.className = "meal-row";
    row.innerHTML = `
      <div class="meal-tag ${slot.key}">${slot.label}</div>
      <div class="meal-body">
        <div class="name">${recipe ? recipe.name : "No recipe available"}</div>
        <div class="ingredients">${recipe ? recipe.ingredients : ""}</div>
        <div class="portion">${recipe ? "Portion: " + recipe.portion : ""}</div>
      </div>
      <div class="meal-actions no-print">
        <button class="btn small" data-swap="${slot.key}">Swap</button>
      </div>
    `;
    container.appendChild(row);
  });
  container.querySelectorAll("[data-swap]").forEach(btn => {
    btn.addEventListener("click", () => openSwapModal(currentDate, btn.getAttribute("data-swap")));
  });
}

function openSwapModal(date, category) {
  const modal = document.getElementById("modal-backdrop");
  const list = document.getElementById("modal-list");
  document.getElementById("modal-title").textContent = `Choose ${category}`;
  list.innerHTML = "";
  poolForSlot(date, category).forEach(r => {
    const div = document.createElement("div");
    div.className = "recipe-pick";
    div.innerHTML = `<strong>${r.name}</strong><br><span style="color:var(--muted);font-size:0.8rem">${r.ingredients}</span>`;
    div.addEventListener("click", () => {
      const key = toKey(date);
      state.plans[key] = state.plans[key] || {};
      state.plans[key][category] = r.id;
      saveState();
      modal.classList.remove("active");
      renderAll();
    });
    list.appendChild(div);
  });
  modal.classList.add("active");
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("modal-backdrop").classList.remove("active");
  });
});

// ---------- rendering: Week view ----------
function renderWeek() {
  const label = document.getElementById("week-label");
  const weekEnd = addDays(currentWeekStart, 6);
  label.textContent = `${fmtShort(currentWeekStart)} – ${fmtShort(weekEnd)}`;
  ensureWeekGenerated(currentWeekStart);
  const grid = document.getElementById("week-grid");
  grid.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const date = addDays(currentWeekStart, i);
    const key = toKey(date);
    const plan = state.plans[key] || {};
    const card = document.createElement("div");
    card.className = "day-card";
    let mealsHtml = "";
    slotsForDate(date).forEach(slot => {
      const recipe = getRecipe(plan[slot.key]);
      mealsHtml += `<div class="day-meal"><div class="lbl">${slot.label}</div><div class="name">${recipe ? recipe.name : "-"}</div></div>`;
    });
    card.innerHTML = `<h3>${date.toLocaleDateString(undefined, { weekday: "long" })} <span class="sub">${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></h3>${mealsHtml}
      <div class="row-actions no-print" style="margin-top:8px">
        <button class="btn small" data-goto="${key}">Open day</button>
        <button class="btn small" data-regen="${key}">Shuffle</button>
      </div>`;
    grid.appendChild(card);
  }
  grid.querySelectorAll("[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentDate = new Date(btn.getAttribute("data-goto"));
      switchView("today");
    });
  });
  grid.querySelectorAll("[data-regen]").forEach(btn => {
    btn.addEventListener("click", () => {
      const date = new Date(btn.getAttribute("data-regen"));
      generateDay(date, true);
      renderWeek();
    });
  });
}

// ---------- rendering: Grocery view ----------
// Prep-state words that describe what you DO with an ingredient at home, not what
// you ask for at the store (e.g. "shredded chicken" -> "chicken"). Product-form
// words like "ground"/"minced" are deliberately left alone.
const PREP_ADJECTIVES = /^(finely\s+)?(steamed|mashed|diced|shredded|grated|sliced|chopped|cooked|scrambled|flaked|slow-cooked|ripe|warm)\s+/i;
const PREP_PHRASES = /\bcut into[^,]*|\bmixed into[^,]*|\bcut small\b|\bfor pan\b|\bfor dipping\b|\buntil soft\b/gi;
const TRAILING_NOISE = /\s+(shapes|topping|filling)$/i;

function normalizeIngredient(raw) {
  let s = raw;
  s = s.replace(/\([^)]*\)/g, ""); // drop parenthetical notes like (deboned), (soft)
  s = s.replace(PREP_PHRASES, "");
  s = s.replace(/^\s*\d+([\/\-]\d+)?\s+/, ""); // drop leading quantity, e.g. "1 egg" -> "egg"
  let prev;
  do { prev = s; s = s.replace(PREP_ADJECTIVES, ""); } while (s !== prev);
  s = s.replace(TRAILING_NOISE, "");
  s = s.replace(/(\w)\/(\w)/g, "$1 or $2");
  s = s.replace(/\s+/g, " ").trim();
  if (s) s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

function groceryItemsForWeek(weekStart) {
  ensureWeekGenerated(weekStart);
  const items = new Map(); // lowercase item -> display text
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const plan = state.plans[toKey(date)] || {};
    slotsForDate(date).forEach(slot => {
      const recipe = getRecipe(plan[slot.key]);
      if (!recipe || !recipe.ingredients) return;
      recipe.ingredients.split(",").forEach(part => {
        const clean = normalizeIngredient(part.trim().replace(/\.$/, ""));
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!items.has(key)) items.set(key, clean);
      });
    });
  }
  return Array.from(items.values()).sort((a, b) => a.localeCompare(b));
}
function renderGrocery() {
  const label = document.getElementById("grocery-label");
  const weekEnd = addDays(currentWeekStart, 6);
  label.textContent = `${fmtShort(currentWeekStart)} – ${fmtShort(weekEnd)}`;
  const items = groceryItemsForWeek(currentWeekStart);
  const list = document.getElementById("grocery-list");
  list.innerHTML = "";
  if (items.length === 0) {
    list.innerHTML = `<li class="empty" style="cursor:default">No ingredients yet — plan the week first.</li>`;
    return;
  }
  items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="box"></span><span>${item}</span>`;
    li.addEventListener("click", () => li.classList.toggle("checked"));
    list.appendChild(li);
  });
}
function groceryTextForWeek(weekStart) {
  const items = groceryItemsForWeek(weekStart);
  let text = `🛒 Shopping list for the week of ${fmtShort(weekStart)} – ${fmtShort(addDays(weekStart, 6))}\n\n`;
  items.forEach(item => { text += `- ${item}\n`; });
  return text.trim();
}

// ---------- rendering: Recipes view ----------
function renderRecipes() {
  const container = document.getElementById("recipe-cols");
  container.innerHTML = "";
  MEAL_SLOTS.forEach(slot => {
    const col = document.createElement("div");
    col.className = "recipe-col";
    col.innerHTML = `<h3>${slot.label}</h3>`;
    recipesByCategory(slot.key).forEach(r => {
      const item = document.createElement("div");
      item.className = "recipe-item";
      const likeActive = r.pref === "like" ? "primary" : "";
      const dislikeActive = r.pref === "dislike" ? "primary" : "";
      item.innerHTML = `
        <div class="name">${r.name} ${r.pref === "like" ? "⭐" : ""}${r.pref === "dislike" ? "🚫" : ""}</div>
        <div class="ingredients">${r.ingredients}</div>
        <div class="portion">Portion: ${r.portion}</div>
        <div class="row-actions no-print">
          <button class="btn small ${likeActive}" data-like="${r.id}">👍 Likes it</button>
          <button class="btn small ${dislikeActive}" data-dislike="${r.id}">👎 Avoid</button>
          <button class="btn small" data-del="${r.id}">Delete</button>
        </div>
      `;
      col.appendChild(item);
    });
    container.appendChild(col);
  });
  container.querySelectorAll("[data-like]").forEach(btn => {
    btn.addEventListener("click", () => {
      const r = getRecipe(btn.getAttribute("data-like"));
      r.pref = r.pref === "like" ? null : "like";
      saveState();
      renderRecipes();
    });
  });
  container.querySelectorAll("[data-dislike]").forEach(btn => {
    btn.addEventListener("click", () => {
      const r = getRecipe(btn.getAttribute("data-dislike"));
      r.pref = r.pref === "dislike" ? null : "dislike";
      saveState();
      renderRecipes();
    });
  });
  container.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      if (confirm("Delete this recipe?")) {
        state.recipes = state.recipes.filter(r => r.id !== id);
        saveState();
        renderRecipes();
      }
    });
  });
}

function setupRecipeForm() {
  const form = document.getElementById("recipe-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("r-name").value.trim();
    const category = document.getElementById("r-category").value;
    const ingredients = document.getElementById("r-ingredients").value.trim();
    const portion = document.getElementById("r-portion").value.trim();
    if (!name) return;
    const id = "u" + Date.now();
    state.recipes.push({ id, category, name, ingredients, portion });
    saveState();
    form.reset();
    renderRecipes();
  });
}

// ---------- export ----------
function planTextForDate(date) {
  const key = toKey(date);
  const plan = state.plans[key];
  if (!plan) return "";
  let text = `🍽️ Meal plan for ${fmtLong(date)}\n\n`;
  slotsForDate(date).forEach(slot => {
    const r = getRecipe(plan[slot.key]);
    if (!r) return;
    text += `${slot.label}: ${r.name}\n  Ingredients: ${r.ingredients}\n  Portion: ${r.portion}\n\n`;
  });
  return text.trim();
}
function planTextForWeek(weekStart) {
  let text = `🍽️ Weekly meal plan (${fmtShort(weekStart)} – ${fmtShort(addDays(weekStart, 6))})\n\n`;
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    text += `— ${fmtLong(date)} —\n`;
    const key = toKey(date);
    const plan = state.plans[key];
    if (plan) {
      slotsForDate(date).forEach(slot => {
        const r = getRecipe(plan[slot.key]);
        if (r) text += `${slot.label}: ${r.name} (${r.portion})\n`;
      });
    }
    text += "\n";
  }
  return text.trim();
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied! You can paste this into WhatsApp.");
  } catch (e) {
    prompt("Copy this text:", text);
  }
}

// ---------- nav / view switching ----------
function setPrintTarget(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("print-target"));
  document.getElementById(viewId).classList.add("print-target");
}
function switchView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
  document.querySelector(`nav button[data-view="${view}"]`).classList.add("active");
  renderAll();
}
function renderAll() {
  renderToday();
  renderWeek();
  renderGrocery();
  renderRecipes();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav button").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.getAttribute("data-view")));
  });

  document.getElementById("prev-day").addEventListener("click", () => {
    currentDate = addDays(currentDate, -1);
    renderToday();
  });
  document.getElementById("next-day").addEventListener("click", () => {
    currentDate = addDays(currentDate, 1);
    renderToday();
  });
  document.getElementById("today-btn").addEventListener("click", () => {
    currentDate = new Date();
    renderToday();
  });
  document.getElementById("shuffle-day").addEventListener("click", () => {
    generateDay(currentDate, true);
    renderToday();
  });
  document.getElementById("copy-day").addEventListener("click", () => {
    copyText(planTextForDate(currentDate));
  });
  document.getElementById("print-day").addEventListener("click", () => {
    setPrintTarget("view-today");
    window.print();
  });

  document.getElementById("prev-week").addEventListener("click", () => {
    currentWeekStart = addDays(currentWeekStart, -7);
    renderAll();
  });
  document.getElementById("next-week").addEventListener("click", () => {
    currentWeekStart = addDays(currentWeekStart, 7);
    renderAll();
  });
  document.getElementById("this-week-btn").addEventListener("click", () => {
    currentWeekStart = startOfWeek(new Date());
    renderAll();
  });
  document.getElementById("shuffle-week").addEventListener("click", () => {
    for (let i = 0; i < 7; i++) generateDay(addDays(currentWeekStart, i), true);
    renderAll();
  });
  document.getElementById("copy-week").addEventListener("click", () => {
    ensureWeekGenerated(currentWeekStart);
    copyText(planTextForWeek(currentWeekStart));
  });
  document.getElementById("print-week").addEventListener("click", () => {
    setPrintTarget("view-week");
    window.print();
  });

  document.getElementById("prev-week-g").addEventListener("click", () => {
    currentWeekStart = addDays(currentWeekStart, -7);
    renderAll();
  });
  document.getElementById("next-week-g").addEventListener("click", () => {
    currentWeekStart = addDays(currentWeekStart, 7);
    renderAll();
  });
  document.getElementById("this-week-g").addEventListener("click", () => {
    currentWeekStart = startOfWeek(new Date());
    renderAll();
  });
  document.getElementById("copy-grocery").addEventListener("click", () => {
    copyText(groceryTextForWeek(currentWeekStart));
  });
  document.getElementById("print-grocery").addEventListener("click", () => {
    setPrintTarget("view-grocery");
    window.print();
  });

  setupRecipeForm();
  renderAll();
});
