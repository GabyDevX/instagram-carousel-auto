const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  // ─── 1. SETUP FOLDER & DATE ───
  // Format: Carousel_YYYY-MM-DD_HH-mm
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-').slice(0, 5);
  const folderName = `Carousel_${dateStr}_${timeStr}`;
  const folderPath = path.join(__dirname, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // ─── 2. COPY SOURCE HTML ───
  // We assume 'hogarcash-export.html' is the source in the current directory
  const sourceFileName = 'carousel.html';
  const sourcePath = path.join(__dirname, sourceFileName);
  const destinationPath = path.join(folderPath, 'source.html');

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`📂 Created: ${folderName}`);
    console.log(`📄 Template archived as source.html`);
  } else {
    console.error(`❌ Error: ${sourceFileName} not found in ${__dirname}`);
    process.exit(1);
  }

  // ─── 3. PUPPETEER EXPORT ───
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu', 
      '--force-color-profile=srgb',
    ]
  });

  const page = await browser.newPage();
  
  // High-DPI for 1080x1080
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const fileUrl = `file://${destinationPath}`;

  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
  } catch (error) {
    console.error('❌ Error loading page:', error);
    await browser.close();
    process.exit(1);
  }

  // Detect slide count
  const slideCount = await page.evaluate(() => {
    return document.querySelectorAll('.slide').length || 7;
  });

  console.log(`🚀 Exporting ${slideCount} slides...`);

  for (let i = 0; i < slideCount; i++) {
    await page.evaluate((index) => {
      if (typeof window.goTo === 'function') window.goTo(index);
    }, i);

    // Buffer for final paint
    await new Promise(r => setTimeout(r, 600));

    const element = await page.$('.viewport');
    if (element) {
      const imgName = `slide-${i + 1}.png`;
      const imgPath = path.join(folderPath, imgName);
      await element.screenshot({ path: imgPath });
      console.log(`✅ Saved: ${folderName}/${imgName}`);
    }
  }

  await browser.close();
  console.log(`\n✨ DONE! Check the folder: ${folderName}`);
})();