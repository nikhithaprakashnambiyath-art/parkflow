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
  { regex: /(?<!dark:)bg-slate-950(?!\/)/g, replacement: 'bg-slate-50 dark:bg-slate-950' },
  { regex: /(?<!dark:)bg-slate-900(?!\/)/g, replacement: 'bg-white dark:bg-slate-900' },
  { regex: /(?<!dark:)text-slate-50/g, replacement: 'text-slate-900 dark:text-slate-50' },
  { regex: /(?<!dark:)text-white/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)text-slate-300/g, replacement: 'text-slate-600 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-400/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)border-white\/10/g, replacement: 'border-slate-200 dark:border-white/10' },
  { regex: /(?<!dark:)border-white\/5/g, replacement: 'border-slate-200 dark:border-white/5' },
  { regex: /(?<!dark:)bg-slate-950\/60/g, replacement: 'bg-white/60 dark:bg-slate-950/60' },
  { regex: /(?<!dark:)bg-slate-950\/40/g, replacement: 'bg-white/40 dark:bg-slate-950/40' },
  { regex: /(?<!dark:)bg-slate-950\/80/g, replacement: 'bg-white/80 dark:bg-slate-950/80' },
  { regex: /(?<!dark:)bg-slate-900\/60/g, replacement: 'bg-slate-100/60 dark:bg-slate-900/60' },
  { regex: /(?<!dark:)bg-slate-900\/40/g, replacement: 'bg-slate-100/40 dark:bg-slate-900/40' },
  { regex: /(?<!dark:)bg-slate-900\/80/g, replacement: 'bg-slate-100/80 dark:bg-slate-900/80' },
  { regex: /(?<!dark:)text-cyan-400/g, replacement: 'text-cyan-600 dark:text-cyan-400' }
];

walk('c:/Users/HP/carpark/frontend', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  replacements.forEach(({ regex, replacement }) => {
    newContent = newContent.replace(regex, replacement);
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
