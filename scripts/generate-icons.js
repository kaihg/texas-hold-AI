import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'masked-icon.svg');

// 確保 public 目錄存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 生成不同尺寸的 PNG 圖標
async function generateIcons() {
  for (const { size, name } of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`Generated ${name}`);
  }

  // 生成 favicon.ico
  await sharp(svgPath)
    .resize(32, 32)
    .toFile(join(publicDir, 'favicon.png'));
  
  await sharp(join(publicDir, 'favicon.png'))
    .toFile(join(publicDir, 'favicon.ico'));
  
  fs.unlinkSync(join(publicDir, 'favicon.png'));
  console.log('Generated favicon.ico');
}

generateIcons().catch(console.error); 