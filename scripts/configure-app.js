const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../app-template/src-tauri/tauri.conf.json');
const appName = process.env.APP_NAME || 'My App';
const appUrl = process.env.APP_URL || 'https://google.com';

// Sanitize app name for identifier (lowercase, alphanumeric only)
let identifierName = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
// Ensure it doesn't start with a digit (Android requirement)
if (/^\d/.test(identifierName)) {
  identifierName = 'app' + identifierName;
}
// Ensure it's not empty
if (identifierName.length === 0) {
  identifierName = "app";
}

const identifier = `com.converted.${identifierName}`;

try {
  const configRaw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configRaw);

  // Update Config
  // Windows WiX build fails if productName starts with a digit
  let safeProductName = appName;
  if (/^\d/.test(safeProductName)) {
    safeProductName = 'App ' + safeProductName;
  }

  config.productName = safeProductName;
  config.identifier = identifier;

  if (config.app && config.app.windows && config.app.windows.length > 0) {
    config.app.windows[0].title = appName; // Title can still remain the original "1"
    config.app.windows[0].url = appUrl;
  }

  // Ensure AndroidConfig exists if needed or just rely on global config
  // In Tauri v2, key properties are often top-level or in 'bundle'

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Updated tauri.conf.json with Name: ${appName}, URL: ${appUrl}, ID: ${identifier}`);

} catch (err) {
  console.error('Error updating tauri.conf.json:', err);
  process.exit(1);
}
