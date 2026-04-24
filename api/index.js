const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();

const isVercel = !!process.env.VERCEL;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

const EXPORTS_DIR = isVercel
  ? '/tmp/exports'
  : path.join(__dirname, '../exports');

fs.ensureDirSync(EXPORTS_DIR);

/**
 * Launch Browser
 */
async function launchBrowser() {
  if (isVercel) {
    const puppeteerCore = require('puppeteer-core');
    const chromium = require('@sparticuz/chromium');
    return await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  // Local development using full puppeteer
  const puppeteer = require('puppeteer');
  return await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
    defaultViewport: {
      width: 1080,
      height: 1080,
      deviceScaleFactor: 2
    }
  });
}

/**
 * Generate carousel images
 */
app.post('/api/generate', async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'HTML is required' });
  }

  const id = uuidv4();
  const folderPath = path.join(EXPORTS_DIR, id);
  await fs.ensureDir(folderPath);

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setViewport({
      width: 1080,
      height: 1080,
      deviceScaleFactor: 2
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    const slideCount = await page.evaluate(() => {
      return document.querySelectorAll('.slide').length;
    });

    if (slideCount === 0) {
        throw new Error('No elements with class "slide" found.');
    }

    const imagesBase64 = [];

    for (let i = 0; i < slideCount; i++) {
      await page.evaluate((index) => {
        if (typeof window.goTo === 'function') {
          window.goTo(index);
        }
      }, i);

      await new Promise(resolve => setTimeout(resolve, 800));

      const element = await page.$('.viewport');
      if (!element) {
        throw new Error('Missing .viewport element in HTML');
      }

      const b64 = await element.screenshot({
        type: 'png',
        encoding: 'base64'
      });
      imagesBase64.push(`data:image/png;base64,${b64}`);

      const imgPath = path.join(folderPath, `slide-${i + 1}.png`);
      await fs.writeFile(imgPath, b64, 'base64');
    }

    const zip = new AdmZip();
    zip.addLocalFolder(folderPath);
    const zipBuffer = zip.toBuffer();

    res.json({
        success: true,
        images: imagesBase64,
        zip: zipBuffer.toString('base64'),
        slides: slideCount
    });

  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: 'Failed to generate images: ' + error.message });
  } finally {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    await fs.remove(folderPath).catch(() => {});
  }
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`🚀 Running at http://localhost:${PORT}`);
  });
}

module.exports = app;
