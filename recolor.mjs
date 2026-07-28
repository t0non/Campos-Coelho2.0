import fs from 'fs';
import path from 'path';

const map = {
  '#1b3b6f': '#111111',
  '#ffe000': '#e5e5e5',
  '#ebd000': '#cccccc',
  '#0056b3': '#333333',
  '#004494': '#222222',
  '#142a4e': '#000000',
  '#e8420a': '#555555',
  '#c93808': '#444444'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldColor, newColor] of Object.entries(map)) {
        // Replace exact case
        if (content.includes(oldColor)) {
          content = content.split(oldColor).join(newColor);
          changed = true;
        }
        // Replace upper case hex just in case
        const upperOld = oldColor.toUpperCase();
        if (content.includes(upperOld)) {
          content = content.split(upperOld).join(newColor);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'components'));
processDirectory(path.join(process.cwd(), 'app'));
