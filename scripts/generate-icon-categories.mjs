import fs from 'fs';
import path from 'path';

const prefixes = ['svg-spinners', 'flag', 'material-symbols', 'vscode-icons'];
const dataDir = path.resolve('public/data');

function slug(str) {
  return str.toLowerCase().replace(/\s*\/\s*/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

prefixes.forEach(prefix => {
  const collectionPath = path.join(dataDir, `${prefix}-collection.json`);
  if (!fs.existsSync(collectionPath)) return;

  const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  const categories = data.categories || {};
  
  const navItems = Object.keys(categories).map(catName => ({
    label: catName,
    href: `category.html?p=${prefix}&c=${slug(catName)}`
  }));

  if (navItems.length > 0) {
    const navPath = path.join(dataDir, `${prefix}-categories-nav.json`);
    fs.writeFileSync(navPath, JSON.stringify(navItems, null, 2));
    console.log(`Generated ${prefix}-categories-nav.json with ${navItems.length} categories.`);
  } else {
    console.log(`${prefix} has no categories.`);
  }
});
