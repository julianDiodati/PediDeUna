(() => {
  const restaurants = window.RESTAURANTS || [];
  const searchInput = document.querySelector('#searchInput');
  const categoryList = document.querySelector('#categoryList');
  const restaurantGrid = document.querySelector('#restaurantGrid');
  const resultCount = document.querySelector('#resultCount');
  const emptyState = document.querySelector('#emptyState');
  const locationButton = document.querySelector('#locationButton');
  const locationDialog = document.querySelector('#locationDialog');
  const locationForm = document.querySelector('#locationForm');
  const locationInput = document.querySelector('#locationInput');
  const locationLabel = document.querySelector('#locationLabel');
  const categoryIcons = {
    Hamburguesas: '🍔', Pizza: '🍕', Empanadas: '🥟', Sandwichs: '🥪',
    Helados: '🍦', Sushi: '🍣', Pollo: '🍗', 'Café y dulces': '🍰',
    Árabe: '🥙', Otros: '🍽️'
  };
  const availableCategories = ['Hamburguesas', 'Pizza', 'Empanadas', 'Sandwichs', 'Helados', 'Sushi'];
  let selectedCategory = 'Todos';

  function normalize(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderCategories() {
    const categories = [...new Set([
      ...availableCategories,
      ...restaurants.map((restaurant) => restaurant.category).filter(Boolean)
    ])];
    categoryList.replaceChildren();
    [['Todos', '🍽️'], ...categories.map((category) => [category, categoryIcons[category] || '🍽️'])]
      .forEach(([category, icon], index) => {
        const button = makeElement('button', `category-chip${index === 0 ? ' is-active' : ''}`);
        button.type = 'button';
        button.dataset.category = category;
        button.setAttribute('aria-pressed', String(index === 0));
        button.append(makeElement('span', '', icon), document.createTextNode(category));
        categoryList.append(button);
      });
  }

  function renderRestaurant(restaurant) {
    const link = makeElement('a', `restaurant-card${restaurant.featured ? ' featured' : ''}`);
    link.href = restaurant.page;
    link.dataset.name = restaurant.name;
    link.dataset.category = restaurant.category;
    link.dataset.search = `${restaurant.searchTerms || ''} ${restaurant.location || ''}`;

    const imageWrap = makeElement('div', 'card-image-wrap');
    const image = makeElement('img');
    image.src = restaurant.image;
    image.alt = restaurant.imageAlt || restaurant.name;
    image.loading = 'lazy';
    imageWrap.append(image);

    if (restaurant.status) {
      const status = makeElement('span', 'status-pill');
      if (Number.isFinite(restaurant.openingTimeMinutes) && Number.isFinite(restaurant.closingTimeMinutes)) {
        status.dataset.opensAt = restaurant.openingTimeMinutes;
        status.dataset.closesAt = restaurant.closingTimeMinutes;
        status.textContent = 'Cerrado';
      } else {
        status.textContent = restaurant.status;
      }
      status.prepend(makeElement('i'));
      imageWrap.append(status);
    }
    if (restaurant.featured) imageWrap.append(makeElement('span', 'image-tag', 'DESTACADO'));

    const content = makeElement('div', 'card-content');
    const titleRow = makeElement('div', 'card-title-row');
    titleRow.append(makeElement('h3', '', restaurant.name));
    if (restaurant.rating) titleRow.append(makeElement('span', 'rating', `★ ${restaurant.rating}`));
    content.append(titleRow, makeElement('p', '', restaurant.description || 'Conocé el menú y elegí tu próximo antojo.'));

    const meta = makeElement('div', 'card-meta');
    meta.append(makeElement('span', '', `${categoryIcons[restaurant.category] || '🍽️'} ${restaurant.category}`));
    if (restaurant.deliveryTime) {
      meta.append(makeElement('span', '', '·'), makeElement('span', '', restaurant.deliveryTime));
    }
    content.append(meta);
    if (restaurant.openingHoursLabel) {
      content.append(makeElement('div', 'card-hours', `🕒 ${restaurant.openingHoursLabel}`));
    }

    const action = makeElement('span', 'card-action', 'Ver menú');
    action.append(makeElement('b', '', '→'));
    content.append(action);
    link.append(imageWrap, content);
    return link;
  }

  function renderRestaurants() {
    restaurantGrid.replaceChildren(...restaurants.map(renderRestaurant));
    document.querySelector('#restaurantsTitle').textContent = restaurants.length === 1
      ? 'Nuestro local'
      : 'Locales para vos';
  }

  function updateCards() {
    const query = normalize(searchInput.value.trim());
    const cards = [...restaurantGrid.children];
    let visibleCount = 0;

    cards.forEach((card) => {
      const categoryMatches = selectedCategory === 'Todos' || card.dataset.category === selectedCategory;
      const searchableText = normalize(`${card.dataset.name} ${card.dataset.category} ${card.dataset.search}`);
      const queryMatches = query === '' || searchableText.includes(query);
      const visible = categoryMatches && queryMatches;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'local' : 'locales'}`;
    emptyState.textContent = selectedCategory !== 'Todos' && query === ''
      ? `Todavía no hay comercios cargados en ${selectedCategory}.`
      : 'No encontramos locales con esa búsqueda. Probá con otra palabra o categoría.';
    emptyState.hidden = visibleCount !== 0;
  }

  function argentinaMinutesNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    const getPart = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
    return getPart('hour') * 60 + getPart('minute');
  }

  function updateRestaurantStatuses() {
    const now = argentinaMinutesNow();
    restaurantGrid.querySelectorAll('.status-pill[data-opens-at]').forEach((status) => {
      const isOpen = now >= Number(status.dataset.opensAt) && now < Number(status.dataset.closesAt);
      status.classList.toggle('is-open', isOpen);
      status.classList.toggle('is-closed', !isOpen);
      status.textContent = isOpen ? 'Abierto' : 'Cerrado';
      status.setAttribute('aria-label', isOpen
        ? 'Local abierto. Todos los días de 19:00 a 23:00.'
        : 'Local cerrado. Todos los días de 19:00 a 23:00.');
      status.prepend(makeElement('i'));
    });
  }

  renderCategories();
  renderRestaurants();
  updateCards();
  updateRestaurantStatuses();
  window.setInterval(updateRestaurantStatuses, 30_000);

  searchInput.addEventListener('input', updateCards);
  categoryList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    selectedCategory = button.dataset.category;
    categoryList.querySelectorAll('.category-chip').forEach((chip) => {
      const active = chip === button;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    updateCards();
  });

  locationButton.addEventListener('click', () => {
    if (typeof locationDialog.showModal === 'function') locationDialog.showModal();
    else locationInput.focus();
  });
  locationForm.addEventListener('submit', (event) => {
    if (event.submitter?.value !== 'confirm') return;
    event.preventDefault();
    const location = locationInput.value.trim();
    if (!location) return locationInput.focus();
    locationLabel.textContent = location;
    locationDialog.close();
  });
})();
