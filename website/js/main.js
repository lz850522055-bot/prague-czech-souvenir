async function loadCatalog() {
  const response = await fetch('./data/catalog.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to load catalog data.');
  return response.json();
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderProductCard(product) {
  const name = escapeHtml(product.name);
  const image = escapeHtml(product.image);
  const alt = escapeHtml(product.alt || product.name);
  const badge = escapeHtml(product.badge || 'Product');
  const note = escapeHtml(product.note || 'Suitable for low-MOQ testing and souvenir retail displays.');
  return `
    <article class="card product-card">
      <div class="img"><img src="${image}" alt="${alt}"></div>
      <div class="body">
        <span class="pill">${badge}</span>
        <h3>${name}</h3>
        <p class="card-note">${note}</p>
      </div>
    </article>
  `;
}

function renderHomeCollections(categories) {
  const root = document.querySelector('[data-home-collections]');
  if (!root) return;
  root.innerHTML = categories.map(category => {
    const buyerFit = Array.isArray(category.buyer_fit) ? category.buyer_fit.slice(0, 4).map(item => `<li>${escapeHtml(item)}</li>`).join('') : '';
    const cards = (category.products || []).slice(0, 5).map(renderProductCard).join('');
    return `
      <section class="collection-section" id="${escapeHtml(category.slug)}">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(category.home_label || category.title)}</p>
            <h3>${escapeHtml(category.title)}</h3>
            <p class="section-copy">${escapeHtml(category.section_copy || '')}</p>
            ${buyerFit ? `<ul class="mini-points">${buyerFit}</ul>` : ''}
          </div>
          <a class="see-all" href="${escapeHtml(category.page_path)}">See more →</a>
        </div>
        <div class="grid">${cards}</div>
      </section>
    `;
  }).join('');
}

function updateContact(site) {
  const emailWrap = document.querySelector('[data-email-contact]');
  const emailLink = document.querySelector('[data-email-link]');
  if (site && site.email_value && emailWrap && emailLink) {
    const email = String(site.email_value).trim();
    emailLink.textContent = email;
    emailLink.href = `mailto:${email}`;
    emailWrap.hidden = false;
  }
  const note = document.querySelector('[data-contact-note]');
  if (note && site && site.contact_note) note.textContent = site.contact_note;
}

function renderCategoryPage(categories, slug) {
  const category = categories.find(item => item.slug === slug);
  const root = document.querySelector('[data-category-root]');
  if (!root) return;

  if (!category) {
    root.innerHTML = `
      <div class="empty-state">
        <p class="eyebrow">Collection</p>
        <h1>Category not found</h1>
        <p class="lead">This category is not available yet.</p>
        <a class="btn btn-primary" href="index.html#collection">Back to collection</a>
      </div>
    `;
    document.title = 'Category not found · Prague / Czech Souvenir Collection Partner';
    return;
  }

  document.title = `${category.title} · Prague / Czech Souvenir Collection Partner`;
  const buyerFit = Array.isArray(category.buyer_fit) ? category.buyer_fit.map(item => `<li>${escapeHtml(item)}</li>`).join('') : '';
  const cards = (category.products || []).map(renderProductCard).join('');

  root.innerHTML = `
    <div class="category-hero panel">
      <p class="eyebrow">${escapeHtml(category.home_label || category.title)}</p>
      <h1>${escapeHtml(category.title)}</h1>
      <p class="lead">${escapeHtml(category.page_intro || category.section_copy || '')}</p>
      ${buyerFit ? `<ul class="mini-points category-points">${buyerFit}</ul>` : ''}
    </div>
    <div class="grid category-grid">${cards}</div>
  `;
}

(async function bootstrap() {
  try {
    const data = await loadCatalog();
    renderHomeCollections(data.categories || []);
    updateContact(data.site || {});

    const categoryRoot = document.querySelector('[data-category-root]');
    if (categoryRoot) {
      const pageSlug = categoryRoot.getAttribute('data-category-slug');
      const querySlug = new URLSearchParams(window.location.search).get('slug');
      renderCategoryPage(data.categories || [], pageSlug || querySlug || '');
    }
  } catch (error) {
    console.error(error);
    const targets = document.querySelectorAll('[data-home-collections], [data-category-root]');
    targets.forEach(node => {
      node.innerHTML = '<p class="load-error">Content is not available yet. Run the build step or publish from the CMS to generate the catalog.</p>';
    });
  }
})();
