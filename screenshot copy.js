const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
  // 'new' headless mode handles CSS gradients and transparency better
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    // Forces hardware acceleration for better rendering of gradients/logos
    '--disable-gpu', 
    '--force-color-profile=srgb',
  ]
});
  const page = await browser.newPage();
  
  // High-res output for that premium Micro-SaaS feel
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const absolutePath = path.resolve(__dirname, 'hogarcash-export.html');
  const fileUrl = `file://${absolutePath}`;

  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    // 1. Wait for Fonts AND Images (the logo) to be fully decoded
    await page.evaluateHandle('document.fonts.ready');
    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll('img'));
      await Promise.all(selectors.map(img => {
        if (img.complete) return;
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }));
    });
  } catch (error) {
    console.error('❌ Error loading page:', error);
    await browser.close();
    return;
  }

  console.log('🚀 Exporting 7 slides with direct navigation...');

  for (let i = 0; i < 7; i++) {
    // 2. Direct Function Call: Tells your HTML exactly which slide to show
    await page.evaluate((index) => {
      if (typeof window.goTo === 'function') {
        window.goTo(index);
      }
    }, i);

    // 3. Wait for the CSS transition to finish 100%
    await new Promise(r => setTimeout(r, 800));

    const element = await page.$('.viewport');
    if (element) {
      await element.screenshot({ 
        path: `slide-${i + 1}.png`,
        omitBackground: false 
      });
      console.log(`✅ Saved: slide-${i + 1}.png`);
    }
  }

  await browser.close();
  console.log('✨ All slides exported correctly!');
})();