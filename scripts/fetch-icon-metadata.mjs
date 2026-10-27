import fs from 'fs';
import https from 'https';
import path from 'path';

const prefixes = ['svg-spinners', 'flag', 'material-symbols', 'vscode-icons'];
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
          fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
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

(async () => {
  for (const prefix of prefixes) {
    try {
      await fetchCollection(prefix);
    } catch (e) {
      console.error(`Error fetching ${prefix}: ${e.message}`);
    }
  }
})();
