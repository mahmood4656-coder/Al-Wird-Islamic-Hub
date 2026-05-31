import fs from 'fs';
import path from 'path';

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('Copying dist/ to flutter_project/assets/dist...');
  if (fs.existsSync('flutter_project/assets/dist')) {
    fs.rmSync('flutter_project/assets/dist', { recursive: true, force: true });
  }
  copyDir('dist', 'flutter_project/assets/dist');
  console.log('Successfully copied assets!');
} catch (err) {
  console.error('Failed to copy assets:', err);
}
