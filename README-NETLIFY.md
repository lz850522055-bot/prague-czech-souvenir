# Prague / Czech Souvenir Collection Partner — Netlify deployment notes

## What changed
- Kept the original static site structure and assets.
- Rewrote the main commercial copy to fit a more professional B2B souvenir-supply tone.
- Replaced hard-coded product grids with a generated catalog feed.
- Added a Netlify + Decap CMS content workflow.
- Added a custom `/my.html` login entry with the requested front-end credentials.
- Added category-based content management so you can add categories and products from the CMS.

## Important deployment requirement
This project must be deployed from a Git-connected Netlify site (GitHub / GitLab / Bitbucket). Do **not** use a one-time drag-and-drop ZIP deploy if you want the CMS to save changes back to the site. The CMS writes content into the connected repository, then Netlify rebuilds and republishes the site.

## Recommended setup steps
1. Put this project into a Git repository.
2. Connect that repository to Netlify.
3. In Netlify: enable **Identity**.
4. In Netlify: set registration to **Invite only**.
5. In Netlify: enable **Git Gateway**.
6. Invite your admin email in **Project configuration → Identity → Users**.
7. Open `admin/admin-auth.js` and set `window.ADMIN_EMAIL` to the exact invited admin email address.
8. Accept the invite email and set the password to `bingxiangtie2026`.
9. Open `/my.html` (or click `我的`) and log in with:
   - username: `prague`
   - password: `bingxiangtie2026`
10. You will be redirected to `/admin/`.

## How the CMS is organized
### Website settings
Collection: `网站设置`
- File: `content/site.json`
- Use this to add a business email and update contact text.

### Product management
Collection: `商品管理（类目）`
- Folder: `content/categories/`
- Each file is one category.
- Inside each category entry you can:
  - change category title / slug / copy
  - add products
  - upload product images
  - rename product names
  - adjust product notes

## How products appear on the public site
1. You edit categories/products in Decap CMS.
2. The CMS saves those category JSON files into `content/categories/`.
3. Netlify runs `node scripts/build-catalog.js`.
4. That build step generates `data/catalog.json`.
5. The public pages load `data/catalog.json` and render the updated category/product content.

## Existing pages kept and upgraded
- `index.html`
- `magnets.html`
- `bottle-openers.html`
- `keychains.html`
- `styles.css`
- `assets/`

## New files and folders added
- `admin/index.html`
- `admin/config.yml`
- `admin/admin-auth.js`
- `my.html`
- `js/main.js`
- `js/login.js`
- `js/admin-guard.js`
- `content/site.json`
- `content/categories/*.json`
- `data/catalog.json`
- `scripts/build-catalog.js`
- `netlify.toml`

## Limitation to know
The front-end login page uses the requested username/password experience, but the actual CMS security still depends on Netlify Identity. That means you must configure one real invited admin email in Netlify Identity. The password for that admin email should be set to `bingxiangtie2026` if you want the `/my.html` login to sign you in automatically.
