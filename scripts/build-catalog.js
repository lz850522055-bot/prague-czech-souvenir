const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const categoriesDir = path.join(root, 'content', 'categories');
const siteFile = path.join(root, 'content', 'site.json');
const outputDir = path.join(root, 'data');
const outputFile = path.join(outputDir, 'catalog.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pagePathForSlug(slug) {
  if (slug === 'magnets') return 'magnets.html';
  if (slug === 'bottle-openers') return 'bottle-openers.html';
  if (slug === 'keychains') return 'keychains.html';
  return `category.html?slug=${encodeURIComponent(slug)}`;
}

function main() {
  const site = fs.existsSync(siteFile) ? readJson(siteFile) : {};
  const categories = fs.readdirSync(categoriesDir)
    .filter(name => name.endsWith('.json'))
    .map(name => readJson(path.join(categoriesDir, name)))
    .sort((a, b) => (a.order || 999) - (b.order || 999) || String(a.title).localeCompare(String(b.title)) )
    .map(category => ({
      ...category,
      page_path: pagePathForSlug(category.slug),
      products: (category.products || []).map((product, index) => ({
        badge: product.badge || category.label || category.title,
        note: product.note || category.default_note || '',
        alt: product.alt || product.name,
        sort_order: index + 1,
        ...product,
      })),
    }));

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify({ generated_at: new Date().toISOString(), site, categories }, null, 2));
  console.log(`Wrote ${outputFile}`);
}

main();
