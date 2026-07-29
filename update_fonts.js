const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx')) {
      callback(path.join(dirPath));
    }
  });
}

walkDir('./src/components', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // A simple but effective way: if a line contains font-heading and font-semibold/font-bold, replace it with font-medium
  let lines = newContent.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('font-heading') && (lines[i].includes('font-semibold') || lines[i].includes('font-bold'))) {
      lines[i] = lines[i].replace(/font-semibold/g, 'font-medium');
      lines[i] = lines[i].replace(/font-bold/g, 'font-medium');
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Updated', filePath);
  }
});
