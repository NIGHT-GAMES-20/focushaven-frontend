import fs from 'fs';
import path from 'path';

const filePath = path.resolve('dist/question.html');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all `./assets/...` with `/assets/...`
content = content.replace(/"\.\/assets/g, '"/assets');

fs.writeFileSync(filePath, content);
console.log('✅ Patched question.html paths.');
