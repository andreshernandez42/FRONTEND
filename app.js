const STORAGE_KEY = "saberdigital_services";
const FAVORITES_KEY = "saberdigital_favorites";

let services = [];
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
let selectedServiceId = null;
let currentCategory = "Todos";

document.addEventListener("DOMContentLoaded", async () => {
  bindMenu();
  bindRoutes();
  bindFilters();
  bindManageForm();
  bindContactForm();

  await loadServices();
  renderAll();
  showPage("home");
});

async function loadServices() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    services = JSON.parse(stored);
    return;
  }

  try {
    const response = await fetch("services.json");
    services = await response.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (error) {
    services = [];
  }
}

function saveServices() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function bindMenu() {
  const toggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  toggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

function bindRoutes() {
  document.addEventListener("click", (e) => {
    const routeItem = e.target.closest("[data-route]");
    if (!routeItem) return;

    e.preventDefault();
    const pageId = routeItem.dataset.route;
    showPage(pageId);

    const mobileMenu = document.getElementById("mobileMenu");
    if (!mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }
  });
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");

  setActiveNav(pageId);

  if (pageId === "catalogo") renderCatalog();
  if (pageId === "favoritos") renderFavorites();
  if (pageId === "gestion") renderManageList();
  if (pageId === "detalle") renderDetail(selectedServiceId);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveNav(pageId) {
  document.querySelectorAll(".nav-link, .mobile-link").forEach(link => {
    link.classList.remove("active-link");
    if (link.dataset.route === pageId) {
      link.classList.add("active-link");
    }
  });
}

function renderAll() {
  renderFeatured();
  renderCatalog();
  renderFavorites();
  renderManageList();
}

function bindFilters() {
  document.querySelectorAll('input[name="category"]').forEach(input => {
    input.addEventListener("change", () => {
      currentCategory = input.value;
      renderCatalog();
    });
  });
}

function renderFeatured() {
  const container = document.getElementById("featuredServices");
  const featured = services.slice(0, 3);

  container.innerHTML = featured.map(service => `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl transition-all duration-300">
      <img src="${service.image}" alt="${service.name}" class="service-image mb-4">
      <span class="text-xs font-semibold text-primary uppercase tracking-wider">${service.category}</span>
      <h3 class="text-xl font-bold text-secondary mt-1 group-hover:text-primary transition">${service.name}</h3>
      <p class="text-slate-600 text-sm mt-2">${service.shortDescription}</p>
      <button onclick="openDetail(${service.id})" class="mt-5 w-full bg-slate-50 text-secondary font-semibold py-2.5 rounded-lg border hover:bg-primary hover:text-white hover:border-primary transition">
        Ver más detalle
      </button>
    </div>
  `).join("");
}

function renderCatalog() {
  const container = document.getElementById("servicesList");

  const filtered = currentCategory === "Todos"
    ? services
    : services.filter(service => service.category === currentCategory);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-slate-500">
        No hay servicios disponibles para esta categoría.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(service => `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl transition relative">
      <button onclick="toggleFavorite(${service.id})" class="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-xl ${favorites.includes(service.id) ? 'favorite-active' : 'text-gray-400'} hover:text-red-500 transition">
        ♥
      </button>
      <img src="${service.image}" alt="${service.name}" class="service-image mb-4">
      <span class="text-xs font-semibold text-primary uppercase tracking-wider">${service.category}</span>
      <h3 class="text-lg font-bold text-secondary mt-1 group-hover:text-primary transition">${service.name}</h3>
      <p class="text-slate-600 text-xs mt-2">${service.shortDescription}</p>
      <button onclick="openDetail(${service.id})" class="mt-4 w-full text-sm bg-slate-50 text-secondary font-semibold py-2 rounded-lg border hover:bg-primary hover:text-white transition">
        Ver detalles
      </button>
    </div>
  `).join("");
}

function openDetail(id) {
  selectedServiceId = id;
  renderDetail(id);
  showPage("detalle");
}

function renderDetail(id) {
  const container = document.getElementById("serviceDetail");
  const service = services.find(item => item.id === id);

  if (!service) {
    container.innerHTML = `
      <div class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center text-slate-500">
        Servicio no encontrado.
      </div>
    `;
    return;
  }

  const isFavorite = favorites.includes(service.id);

  container.innerHTML = `
    <div class="flex flex-col md:flex-row gap-10 items-start">
      <div class="flex-1 w-full space-y-4">
        <div class="bg-white p-4 rounded-3xl shadow-lg border border-gray-100">
          <img src="${service.image}" alt="${service.name}" class="detail-image">
        </div>
      </div>

      <div class="flex-1 space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <span class="inline-block bg-blue-100 text-primary text-xs font-semibold px-3 py-1 rounded-full">${service.category.toUpperCase()}</span>
        <h1 class="text-4xl font-extrabold text-secondary leading-tight">${service.name}</h1>
        <p class="text-2xl font-bold text-slate-900">$199.99 <span class="text-sm text-slate-500 font-normal">/ pago único</span></p>

        <div class="border-t border-b py-6 space-y-4 text-slate-700 leading-relaxed">
          <h3 class="font-bold text-secondary">Descripción completa</h3>
          <p>${service.fullDescription}</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <button data-route="contacto" class="route-btn flex-1 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-600 transition shadow-md shadow-blue-200">
            Contactar para Inscribirse
          </button>
          <button onclick="toggleFavorite(${service.id})" class="bg-slate-100 ${isFavorite ? 'text-red-500' : 'text-slate-700'} px-6 py-3.5 rounded-xl font-semibold hover:bg-red-50 transition border border-red-100">
            ♥ ${isFavorite ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
  } else {
    favorites.push(id);
  }

  saveFavorites();
  renderFeatured();
  renderCatalog();
  renderFavorites();

  if (selectedServiceId === id) {
    renderDetail(id);
  }
}

function renderFavorites() {
  const container = document.getElementById("favoritesList");
  const favoriteServices = services.filter(service => favorites.includes(service.id));

  if (!favoriteServices.length) {
    container.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-slate-500">
        No tienes servicios guardados en favoritos.
      </div>
    `;
    return;
  }

  container.innerHTML = favoriteServices.map(service => `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl transition relative">
      <button onclick="toggleFavorite(${service.id})" class="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-xl favorite-active hover:text-red-500 transition">
        ♥
      </button>
      <img src="${service.image}" alt="${service.name}" class="service-image mb-4">
      <span class="text-xs font-semibold text-primary uppercase tracking-wider">${service.category}</span>
      <h3 class="text-lg font-bold text-secondary mt-1">${service.name}</h3>
      <p class="text-slate-600 text-xs mt-2">${service.shortDescription}</p>
      <button onclick="openDetail(${service.id})" class="mt-4 w-full text-sm bg-slate-50 text-secondary font-semibold py-2 rounded-lg border hover:bg-primary hover:text-white transition">
        Ver detalles
      </button>
    </div>
  `).join("");
}

function bindManageForm() {
  const form = document.getElementById("manageForm");
  const message = document.getElementById("manageMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    message.classList.add("hidden");

    const name = document.getElementById("serviceName");
    const category = document.getElementById("serviceCategory");
    const shortDesc = document.getElementById("serviceShort");
    const fullDesc = document.getElementById("serviceFull");
    const image = document.getElementById("serviceImage");

    let valid = true;
    valid = validateField(name, value => value.trim() !== "") && valid;
    valid = validateField(category, value => value.trim() !== "") && valid;
    valid = validateField(shortDesc, value => value.trim() !== "") && valid;
    valid = validateField(fullDesc, value => value.trim() !== "") && valid;
    valid = validateField(image, value => /^https?:\/\/.+/i.test(value)) && valid;

    if (!valid) return;

    const newService = {
      id: Date.now(),
      name: name.value.trim(),
      category: category.value,
      shortDescription: shortDesc.value.trim(),
      fullDescription: fullDesc.value.trim(),
      image: image.value.trim()
    };

    services.push(newService);
    saveServices();
    renderAll();
    form.reset();

    message.textContent = "Servicio creado correctamente.";
    message.classList.remove("hidden");
  });
}

function renderManageList() {
  const container = document.getElementById("manageServicesList");
  const count = document.getElementById("manageCount");

  count.textContent = `${services.length} servicios`;

  if (!services.length) {
    container.innerHTML = `<div class="text-slate-500 text-sm">No hay servicios registrados.</div>`;
    return;
  }

  container.innerHTML = services.map(service => `
    <div class="border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 class="font-bold text-secondary">${service.name}</h3>
        <p class="text-sm text-slate-500">${service.category}</p>
      </div>
      <button onclick="deleteService(${service.id})" class="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition">
        Eliminar
      </button>
    </div>
  `).join("");
}

function deleteService(id) {
  services = services.filter(service => service.id !== id);
  favorites = favorites.filter(fav => fav !== id);

  saveServices();
  saveFavorites();

  if (selectedServiceId === id) {
    selectedServiceId = null;
  }

  renderAll();
}

function bindContactForm() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("contactSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    success.classList.add("hidden");

    const name = document.getElementById("contactName");
    const email = document.getElementById("contactEmail");
    const message = document.getElementById("contactMessage");
    const policy = document.getElementById("contactPolicy");
    const policyError = document.getElementById("policyError");

    let valid = true;
    valid = validateField(name, value => value.trim() !== "") && valid;
    valid = validateField(email, value => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) && valid;
    valid = validateField(message, value => value.trim() !== "") && valid;

    if (!policy.checked) {
      policyError.classList.remove("hidden");
      valid = false;
    } else {
      policyError.classList.add("hidden");
    }

    if (!valid) return;

    form.reset();
    success.classList.remove("hidden");
  });
}

function validateField(field, validator) {
  const error = field.parentElement.querySelector(".error-text");
  const isValid = validator(field.value);

  if (!isValid) {
    field.classList.add("input-error");
    if (error) error.classList.remove("hidden");
    return false;
  }

  field.classList.remove("input-error");
  if (error) error.classList.add("hidden");
  return true;
}