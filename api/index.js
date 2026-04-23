// api/index.js
const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
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

app.post('/api/generate', async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({
      error: 'HTML is required'
    });
  }

  const id = uuidv4();
  const folderPath = path.join(EXPORTS_DIR, id);

  await fs.ensureDir(folderPath);

  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: {
        width: 1080,
        height: 1440,
        deviceScaleFactor: 2
      }
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    await page.evaluateHandle('document.fonts.ready');

    const slideCount = await page.evaluate(() => {
      return document.querySelectorAll('.slide').length || 7;
    });

    for (let i = 0; i < slideCount; i++) {
      await page.evaluate((index) => {
        if (typeof window.goTo === 'function') {
          window.goTo(index);
        }
      }, i);

      await new Promise(r => setTimeout(r, 700));

      const element = await page.$('.viewport');

      if (!element) {
        throw new Error('Missing .viewport element in HTML');
      }

      const imgPath = path.join(folderPath, `slide-${i + 1}.png`);

      await element.screenshot({
        path: imgPath
      });
    }

    const zip = new AdmZip();
    zip.addLocalFolder(folderPath);

    const zipBuffer = zip.toBuffer();

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="carousel-${id}.zip"`,
      'Content-Length': zipBuffer.length
    });

    res.send(zipBuffer);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to generate images: ' + error.message
    });

  } finally {
    if (browser) {
      await browser.close();
    }

    await fs.remove(folderPath).catch(() => {});
  }
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
