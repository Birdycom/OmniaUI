// Refresh the icon data in public/data from the Iconify API ("npm run icons:update"; then "npm run site:build").
// MDI itself: mdi-collection.json, plus the MDI Light name list and the MDI categories that have Light icons.
import fs from 'fs';
import https from 'https';
import path from 'path';

const prefixes = ['mdi', 'mdi-light', 'svg-spinners', 'flag', 'material-symbols', 'vscode-icons'];
const dataDir = path.resolve('public/data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function fetchCollection(prefix) {
  const url = `https://api.iconify.design/collection?prefix=${prefix}`;
  console.log(`Fetching ${prefix} from ${url}...`);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const filePath = path.join(dataDir, `${prefix}-collection.json`);
          fs.writeFileSync(filePath, JSON.stringify(json)); // compact: the category page downloads these
          console.log(`Saved ${prefix}-collection.json (${Math.round(data.length / 1024)} KB)`);
          resolve();
        } catch (e) {
          reject(new Error(`Failed to parse ${prefix}: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function slug(str) {
  return str.toLowerCase().replace(/\s*\/\s*/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function names(data) {
  return [...new Set([...(data.uncategorized || []), ...Object.values(data.categories || {}).flat()])].sort();
}

(async () => {
  // Stop on the first failure (the API rate-limits with "error code: 1015"): the files on disk stay as they were.
  for (const prefix of prefixes) {
    try {
      await fetchCollection(prefix);
    } catch (e) {
      console.error(`Error fetching ${prefix}: ${e.message}`);
      process.exit(1);
    }
  }
  // MDI Light: the catalog reads a plain name list and the MDI category slugs that have Light icons.
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  const light = names(read('mdi-light-collection.json'));
  const lightSet = new Set(light);
  const mdi = read('mdi-collection.json');
  const mdiCats = { ...mdi.categories, Uncategorized: mdi.uncategorized || [] };
  const lightCats = Object.keys(mdiCats).filter((c) => mdiCats[c].some((n) => lightSet.has(n))).map(slug);
  fs.writeFileSync(path.join(dataDir, 'mdi-light-icons.json'), JSON.stringify(light));
  fs.writeFileSync(path.join(dataDir, 'mdi-light-categories.json'), JSON.stringify(lightCats));
  fs.rmSync(path.join(dataDir, 'mdi-light-collection.json'));
  console.log(`MDI Light: ${light.length} icons in ${lightCats.length} MDI categories`);
})();
