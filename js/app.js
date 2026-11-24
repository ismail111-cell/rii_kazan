(() => {
  const data = window.KIU_DATA;

  // --- Навигация между разделами ---
  const navLinks = document.querySelectorAll('[data-view]');
  const views = document.querySelectorAll('.view');
  const mainNav = document.getElementById('main-nav');

  function switchView(viewId) {
    views.forEach(v => v.classList.toggle('active', v.id === `view-${viewId}`));
    document.querySelectorAll('.nav__link').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });
    mainNav.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', `#${viewId}`);
  }

  navLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(el.dataset.view);
    });
  });

  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  // --- Рендер новостей ---
  const newsGrid = document.getElementById('home-news-grid');
  newsGrid.innerHTML = data.news.map((item, idx) => `
    <article class="news-card ${idx === 0 ? 'news-card--featured' : ''}">
      <img class="news-card__img" src="${item.image}" alt="${item.title}" loading="lazy"
           onerror="this.style.display='none'">
      <div class="news-card__body">
        <span class="news-card__date">${item.date}</span>
        <h3 class="news-card__title">
          <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
        </h3>
        <p class="news-card__text">${item.summary}</p>
      </div>
    </article>
  `).join('');

  // --- Рендер партнёров ---
  document.getElementById('partners-grid').innerHTML = data.partners.map(p => `
    <a class="partner-card" href="${p.url}" target="_blank" rel="noopener">
      <strong>${p.name}</strong>
      <span>${p.url.replace(/^https?:\/\//, '')} ↗</span>
    </a>
  `).join('');

  // --- Рендер таблиц поступления ---
  document.getElementById('abit-vo-table').innerHTML = data.admissionVO.map((row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${row.program}</strong></td>
      <td>${row.qualification}</td>
      <td style="white-space:pre-line">${row.form}</td>
      <td style="white-space:pre-line">${row.exams}</td>
    </tr>
  `).join('');

  document.getElementById('abit-spro-table').innerHTML = data.admissionSPRO.map((row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${row.program}</strong></td>
      <td>${row.qualification}</td>
      <td>${row.form}</td>
      <td style="white-space:pre-line">${row.exams}</td>
      <td>${row.price}</td>
    </tr>
  `).join('');

  document.getElementById('abit-docs-list').innerHTML = data.documents
    .filter(d => d.category === 'Абитуриентам')
    .map(renderDocItem).join('');

  // --- Рендер расписания ---
  document.getElementById('schedule-grid').innerHTML = data.schedules.map(block => `
    <div class="schedule-card">
      <div>
        <h3>${block.group}</h3>
        <small style="color:var(--text-muted)">${block.note}</small>
      </div>
      <div class="schedule-links">
        ${block.items.map(item => `
          <a class="schedule-link" href="${item.url}" target="_blank" rel="noopener">
            <span>${item.label}</span>
            <span class="doc-badge">PDF</span>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');

  // --- Рендер Сведений об ОО и каталога документов ---
  document.getElementById('svedeniya-grid').innerHTML = data.svedeniyaSections.map(s => `
    <a class="sved-card" href="${s.url}" target="_blank" rel="noopener">
      <span>${s.title}</span>
      <span>↗</span>
    </a>
  `).join('');

  function renderDocItem(doc) {
    return `
      <a class="doc-item" href="${doc.url}" target="_blank" rel="noopener">
        <div>
          <div class="doc-item__cat">${doc.category}</div>
          <div class="doc-item__title">${doc.title}</div>
        </div>
        <span class="doc-badge">${doc.ext}</span>
      </a>
    `;
  }

  let activeCategory = 'Все';
  const docsSearch = document.getElementById('docs-search');
  const docsList = document.getElementById('docs-list');
  const docPills = document.querySelectorAll('#docs-filter .pill');

  function renderDocs() {
    const q = docsSearch.value.trim().toLowerCase();
    const filtered = data.documents.filter(d => {
      const catOk = activeCategory === 'Все' || d.category === activeCategory;
      const textOk = !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
      return catOk && textOk;
    });
    docsList.innerHTML = filtered.length
      ? filtered.map(renderDocItem).join('')
      : '<p style="color:var(--text-muted)">Документы по запросу не найдены.</p>';
  }

  docPills.forEach(pill => {
    pill.addEventListener('click', () => {
      docPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.cat;
      renderDocs();
    });
  });
  docsSearch.addEventListener('input', renderDocs);
  renderDocs();

  // --- Наука и воспитание ---
  document.getElementById('science-docs-list').innerHTML = data.documents
    .filter(d => d.category === 'Наука' || d.category === 'Воспитание')
    .map(renderDocItem).join('');

  // --- Контакты с поиском ---
  const contactsSearch = document.getElementById('contacts-search');
  const contactsGrid = document.getElementById('contacts-grid');

  function renderContacts() {
    const q = contactsSearch.value.trim().toLowerCase();
    const filtered = data.contacts.filter(c =>
      !q || `${c.group} ${c.role} ${c.person} ${c.room} ${c.phone}`.toLowerCase().includes(q)
    );
    contactsGrid.innerHTML = filtered.map(c => `
      <div class="contact-card">
        <div class="contact-card__group">${c.group}</div>
        <div class="contact-card__role">${c.role}</div>
        <div class="contact-card__person">${c.person}</div>
        <div class="contact-card__meta">
          <span>📍 ${c.room}</span>
          <span>📞 ${c.phone}</span>
        </div>
      </div>
    `).join('');
  }
  contactsSearch.addEventListener('input', renderContacts);
  renderContacts();

  // --- Режим для слабовидящих ---
  const a11yBar = document.getElementById('a11y-bar');
  document.getElementById('toggle-a11y').addEventListener('click', () => {
    a11yBar.classList.toggle('open');
  });

  document.querySelectorAll('[data-font]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.documentElement.classList.remove('a11y-lg', 'a11y-xl');
      if (btn.dataset.font === 'lg') document.documentElement.classList.add('a11y-lg');
      if (btn.dataset.font === 'xl') document.documentElement.classList.add('a11y-xl');
    });
  });

  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.remove('a11y-bw', 'a11y-dark');
      if (btn.dataset.theme === 'bw') document.body.classList.add('a11y-bw');
      if (btn.dataset.theme === 'dark') document.body.classList.add('a11y-dark');
    });
  });

  document.getElementById('toggle-imgs').addEventListener('click', (e) => {
    const hidden = document.body.classList.toggle('a11y-no-img');
    e.target.textContent = hidden ? 'Показать фото' : 'Скрыть фото';
  });

  // Открытие нужного раздела по хэшу в URL
  const initialHash = location.hash.replace('#', '');
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    switchView(initialHash);
  }
})();
