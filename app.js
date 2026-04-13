const STORAGE_KEYS = {
  services: 'saberdigital_services',
  favorites: 'saberdigital_favorites'
};

let services = [];
let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || [];
let selectedServiceId = null;

const pages = document.querySelectorAll('.page');
const routeLinks = document.querySelectorAll('.route-link');
const featuredServicesContainer = document.getElementById('featured-services');
const servicesListContainer = document.getElementById('services-list');
const favoritesListContainer = document.getElementById('favorites-list');
const serviceDetailContainer = document.getElementById('service-detail');
const manageServicesList = document.getElementById('manage-services-list');
const manageCount = document.getElementById('manage-count');
const categoryFilter = document.getElementById('category-filter');
const heroTotalServices = document.getElementById('hero-total-services');
const heroTotalFavorites = document.getElementById('hero-total-favorites');

const fallbackServices = [
  {
    id: 1,
    name: 'Plataforma Educativa Interactiva',
    category: 'Educativo',
    shortDescription: 'Sistema de aprendizaje adaptativo con recursos digitales.',
    fullDescription: 'Servicio orientado a instituciones o usuarios que requieren entornos de formación con contenidos, seguimiento académico y acceso multiplataforma.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 2,
    name: 'Soluciones Cloud Empresariales',
    category: 'Tecnológico',
    shortDescription: 'Infraestructura escalable y segura para operación digital.',
    fullDescription: 'Servicio enfocado en despliegue y acompañamiento de soluciones en la nube para mejorar disponibilidad, escalabilidad y continuidad operativa.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 3,
    name: 'Turismo Virtual 360°',
    category: 'Turístico',
    shortDescription: 'Experiencias inmersivas para conocer destinos de forma digital.',
    fullDescription: 'Servicio que presenta recorridos virtuales e información de destinos mediante recursos interactivos de alta calidad visual.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 4,
    name: 'Tienda Comercial Digital',
    category: 'Comercial',
    shortDescription: 'Catálogo web para exhibición y promoción de productos o servicios.',
    fullDescription: 'Servicio orientado a negocios que necesitan presencia digital para mostrar su portafolio, ampliar alcance y facilitar el contacto con clientes.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    featured: false
  }
];

async function loadServices() {
  const savedServices = JSON.parse(localStorage.getItem(STORAGE_KEYS.services));
  if (savedServices?.length) {
    services = savedServices;
    renderAll();
    return;
  }

  try {
    const response = await fetch('services.json');
    if (!response.ok) throw new Error('No fue posible cargar services.json');
    services = await response.json();
  } catch (error) {
    services = fallbackServices;
  }

  persistServices();
  renderAll();
}

function persistServices() {
  localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
}

function persistFavorites() {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
}

function changeRoute(route) {
  pages.forEach(page => page.classList.remove('active-page'));
  document.getElementById(`page-${route}`).classList.add('active-page');
  routeLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.route === route);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAll() {
  renderFeaturedServices();
  renderServicesList();
  renderFavorites();
  renderManageList();
  updateCounters();

  if (selectedServiceId) {
    renderDetail(selectedServiceId);
  }
}

function updateCounters() {
  heroTotalServices.textContent = services.length;
  heroTotalFavorites.textContent = favorites.length;
  manageCount.textContent = `${services.length} servicio${services.length !== 1 ? 's' : ''}`;
}

function getCategoryClass(category) {
  return `<span class="category-badge">${category}</span>`;
}

function createCard(service, showDelete = false) {
  const isFavorite = favorites.includes(service.id);

  return `
    <div class="col-md-6 col-xl-4">
      <article class="service-card h-100">
        <img src="${service.image}" alt="${service.name}">
        <div class="p-4 d-flex flex-column h-100">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            ${getCategoryClass(service.category)}
            <button class="btn btn-sm favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${service.id})" title="Favorito">
              ${isFavorite ? '♥' : '♡'}
            </button>
          </div>
          <h3 class="h5 fw-bold">${service.name}</h3>
          <p class="text-muted flex-grow-1 mb-4">${service.shortDescription}</p>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-primary-custom flex-grow-1" onclick="openDetail(${service.id})">Ver más</button>
            ${showDelete ? `<button class="btn btn-outline-danger" onclick="deleteService(${service.id})">Eliminar</button>` : ''}
          </div>
        </div>
      </article>
    </div>
  `;
}

function renderFeaturedServices() {
  const featured = services.filter(service => service.featured).slice(0, 3);
  featuredServicesContainer.innerHTML = featured.map(service => createCard(service)).join('');
}

function renderServicesList() {
  const filter = categoryFilter.value;
  const filteredServices = filter === 'all'
    ? services
    : services.filter(service => service.category === filter);

  servicesListContainer.innerHTML = filteredServices.length
    ? filteredServices.map(service => createCard(service)).join('')
    : `<div class="col-12"><div class="empty-state">No hay servicios para la categoría seleccionada.</div></div>`;
}

function renderDetail(serviceId) {
  const service = services.find(item => item.id === serviceId);
  if (!service) return;

  const isFavorite = favorites.includes(service.id);
  serviceDetailContainer.innerHTML = `
    <div class="detail-box p-3 p-lg-4">
      <div class="row g-4 align-items-stretch">
        <div class="col-lg-6">
          <img class="detail-image" src="${service.image}" alt="${service.name}">
        </div>
        <div class="col-lg-6 d-flex flex-column">
          ${getCategoryClass(service.category)}
          <h2 class="fw-bold mt-3">${service.name}</h2>
          <p class="text-muted mb-3">${service.shortDescription}</p>
          <p class="mb-4">${service.fullDescription}</p>
          <div class="d-flex gap-2 flex-wrap mt-auto">
            <button class="btn btn-primary-custom" onclick="changeRoute('contact')">Contactar</button>
            <button class="btn favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${service.id})">
              ${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openDetail(serviceId) {
  selectedServiceId = serviceId;
  renderDetail(serviceId);
  changeRoute('detail');
}

function toggleFavorite(serviceId) {
  if (favorites.includes(serviceId)) {
    favorites = favorites.filter(id => id !== serviceId);
  } else {
    favorites.push(serviceId);
  }

  persistFavorites();
  renderAll();
}

function renderFavorites() {
  const favoriteServices = services.filter(service => favorites.includes(service.id));
  favoritesListContainer.innerHTML = favoriteServices.length
    ? favoriteServices.map(service => createCard(service)).join('')
    : `<div class="col-12"><div class="empty-state">Aún no has agregado servicios a favoritos.</div></div>`;
}

function renderManageList() {
  manageServicesList.innerHTML = services.length
    ? services.map(service => `
        <div class="manage-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div class="mb-2">${getCategoryClass(service.category)}</div>
            <h3 class="h6 fw-bold mb-1">${service.name}</h3>
            <p class="mb-0 text-muted">${service.shortDescription}</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" onclick="openDetail(${service.id})">Ver</button>
            <button class="btn btn-outline-danger" onclick="deleteService(${service.id})">Eliminar</button>
          </div>
        </div>
      `).join('')
    : `<div class="empty-state">No hay servicios registrados.</div>`;
}

function deleteService(serviceId) {
  services = services.filter(service => service.id !== serviceId);
  favorites = favorites.filter(id => id !== serviceId);
  if (selectedServiceId === serviceId) selectedServiceId = null;
  persistServices();
  persistFavorites();
  renderAll();

  if (document.getElementById('page-detail').classList.contains('active-page')) {
    changeRoute('services');
  }
}

function setupEvents() {
  document.addEventListener('click', event => {
    const routeTarget = event.target.closest('[data-route]');
    if (!routeTarget) return;
    event.preventDefault();
    changeRoute(routeTarget.dataset.route);
  });

  categoryFilter.addEventListener('change', renderServicesList);

  const manageForm = document.getElementById('manage-form');
  const manageMessage = document.getElementById('manage-message');
  manageForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!manageForm.checkValidity()) {
      manageForm.classList.add('was-validated');
      return;
    }

    const newService = {
      id: Date.now(),
      name: document.getElementById('service-name').value.trim(),
      category: document.getElementById('service-category').value,
      shortDescription: document.getElementById('service-short').value.trim(),
      fullDescription: document.getElementById('service-full').value.trim(),
      image: document.getElementById('service-image').value.trim(),
      featured: false
    };

    services.push(newService);
    persistServices();
    renderAll();
    manageForm.reset();
    manageForm.classList.remove('was-validated');
    manageMessage.textContent = 'Servicio creado correctamente.';
    manageMessage.classList.remove('d-none');
    setTimeout(() => manageMessage.classList.add('d-none'), 2500);
  });

  const contactForm = document.getElementById('contact-form');
  const contactSuccess = document.getElementById('contact-success');
  contactForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.classList.add('was-validated');
      return;
    }

    const name = document.getElementById('contact-name').value.trim();
    contactSuccess.textContent = `Gracias, ${name}. Tu mensaje fue enviado correctamente.`;
    contactSuccess.classList.remove('d-none');
    contactForm.reset();
    contactForm.classList.remove('was-validated');
    setTimeout(() => contactSuccess.classList.add('d-none'), 3000);
  });
}

setupEvents();
loadServices();

window.toggleFavorite = toggleFavorite;
window.openDetail = openDetail;
window.deleteService = deleteService;
window.changeRoute = changeRoute;
