import * as fs from 'fs';

const content = fs.readFileSync('src/data.ts', 'utf-8');
const blocks = content.split('} as unknown as AudioItem');

const allItems = [];
for (const block of blocks) {
  const idM = block.match(/id:\s*"([^"]+)"/);
  if (idM) {
    const id = idM[1];
    const category = block.match(/category:\s*"([^"]+)"/)?.[1] || '';
    const title = block.match(/title:\s*"([^"]+)"/)?.[1] || '';
    const audioUrl = block.match(/audioUrl:\s*"([^"]+)"/)?.[1] || '';
    const duration = block.match(/duration:\s*"([^"]+)"/)?.[1] || '';
    const arabicText = block.match(/arabicText:\s*"([^"]+)"/)?.[1] || '';
    allItems.push({ id, category, title, audioUrl, duration, arabicText: arabicText.substring(0, 40) });
  }
}

console.log(JSON.stringify(allItems.slice(15, 30), null, 2));
