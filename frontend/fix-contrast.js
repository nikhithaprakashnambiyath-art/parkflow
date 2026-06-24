const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory && f !== 'node_modules' && f !== '.next') {
      walk(dirPath, callback);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      callback(path.join(dir, f));
    }
  });
};

const replacements = [
  // Make the background a bit cooler/darker in light mode so cards pop out
  { regex: /bg-slate-50 dark:bg-slate-950/g, replacement: 'bg-slate-100 dark:bg-slate-950' },
  // Make cards pure white with better borders and shadows
  { regex: /bg-slate-100\/60 dark:bg-slate-900\/60/g, replacement: 'bg-white shadow-sm dark:bg-slate-900/60' },
  { regex: /bg-slate-100\/40 dark:bg-slate-900\/40/g, replacement: 'bg-white shadow-sm dark:bg-slate-900/40' },
  { regex: /bg-slate-100\/80 dark:bg-slate-900\/80/g, replacement: 'bg-white shadow-sm dark:bg-slate-900/80' },
  { regex: /bg-white\/60 dark:bg-slate-950\/60/g, replacement: 'bg-white shadow-sm dark:bg-slate-950/60' },
  { regex: /bg-white\/40 dark:bg-slate-950\/40/g, replacement: 'bg-white shadow-sm dark:bg-slate-950/40' },
  // Increase text contrast
  { regex: /text-slate-500 dark:text-slate-400/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /text-slate-600 dark:text-slate-300/g, replacement: 'text-slate-700 dark:text-slate-300' },
  // Increase border contrast
  { regex: /border-slate-200 dark:border-white\/5/g, replacement: 'border-slate-300 dark:border-white/5' },
  { regex: /border-slate-200 dark:border-white\/10/g, replacement: 'border-slate-300 dark:border-white/10' },
  // Fix button text on cyan buttons if it's text-slate-900 it's fine, but let's ensure it's bold
  { regex: /text-slate-900 dark:text-white/g, replacement: 'text-slate-950 dark:text-white font-medium' }
];

walk('c:/Users/HP/carpark/frontend', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  replacements.forEach(({ regex, replacement }) => {
    newContent = newContent.replace(regex, replacement);
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated contrast in ${filePath}`);
  }
});
