const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!f.endsWith('page.tsx')) continue;
    let content = fs.readFileSync(full, 'utf8');
    if (content.includes("'use client'")) continue;
    if (content.includes('force-dynamic')) continue;
    content = "export const dynamic = 'force-dynamic'\n" + content;
    fs.writeFileSync(full, content);
    console.log('Patched:', full);
  }
}
walk('app');
