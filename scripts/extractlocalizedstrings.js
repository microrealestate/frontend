const fs = require('fs');
const path = require('path');
const { fdir } = require('fdir');

// read exisiting en locale file
let enFile;
try {
  enFile = require(path.resolve(__dirname, '../locales/en/common.json'));
} catch (error) {
  enFile = {};
}

// parse source code to extract the i18n keys
const files = new fdir()
  .withBasePath()
  .withDirs()
  .glob('./**/*.js')
  .crawl(path.resolve(__dirname, '../src'))
  .sync();

// merge keys found with existing en locale file and sort it
const strings = Object.entries(
  files.reduce((acc, file) => {
    const content = fs.readFileSync(file, { encoding: 'utf8' });
    const keys = Array.from(content.matchAll(/[\s{(,}:]t\(\s*'(.+?)'/g));

    if (keys.length) {
      keys.map(([, key]) => {
        acc[key] = key;
      });
    }

    return acc;
  }, enFile)
).sort(([a], [b]) => a.localeCompare(b));

// create the updated json en strings
const jsonDevLocaleFile = [
  '{',
  strings.map(([key, value]) => `  "${key}": "${value}"`).join(',\n'),
  '}',
];

// replace existing local en file with new content
fs.writeFileSync(
  path.resolve(__dirname, '../locales/en/common.json'),
  jsonDevLocaleFile.join('\n'),
  { encoding: 'utf8' }
);
