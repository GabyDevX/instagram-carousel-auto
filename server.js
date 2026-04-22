const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Directorios para archivos temporales (usa /tmp en Vercel)
const isVercel = process.env.VERCEL === '1';
const EXPORTS_DIR = isVercel ? '/tmp/exports' : path.join(__dirname, 'exports');

fs.ensureDirSync(EXPORTS_DIR);

app.post('/api/generate', async (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'HTML is required' });

    const id = uuidv4();
    const folderPath = path.join(EXPORTS_DIR, id);

    await fs.ensureDir(folderPath);

    let browser;
    try {
        const options = isVercel 
            ? {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
              }
            : {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: 'new',
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Ajustar según SO o dejar que puppeteer-core lo busque
              };

        // Fallback para desarrollo local si no se especifica executablePath
        if (!isVercel && !fs.existsSync(options.executablePath)) {
            delete options.executablePath;
            // Si usamos puppeteer normal en local, esto fallará con puppeteer-core a menos que instalemos puppeteer
        }

        // Para facilitar desarrollo local, intentamos requerir 'puppeteer' si no estamos en Vercel
        let launcher = puppeteer;
        if (!isVercel) {
            try {
                launcher = require('puppeteer');
            } catch (e) {
                console.log('Puppeteer not found, using puppeteer-core');
            }
        }

        browser = await launcher.launch(isVercel ? options : {
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');

        const slideCount = await page.evaluate(() => {
            return document.querySelectorAll('.slide').length || 7;
        });

        for (let i = 0; i < slideCount; i++) {
            await page.evaluate((index) => {
                if (typeof window.goTo === 'function') window.goTo(index);
            }, i);

            await new Promise(r => setTimeout(r, 600));

            const element = await page.$('.viewport');
            if (element) {
                const imgName = `slide-${i + 1}.png`;
                const imgPath = path.join(folderPath, imgName);
                await element.screenshot({ path: imgPath });
            }
        }

        const zip = new AdmZip();
        zip.addLocalFolder(folderPath);
        const zipBuffer = zip.toBuffer();

        // Enviar ZIP directamente
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="carousel-${id}.zip"`,
            'Content-Length': zipBuffer.length
        });
        res.send(zipBuffer);

    } catch (error) {
        console.error('Error generating carousel:', error);
        res.status(500).json({ error: 'Failed to generate images: ' + error.message });
    } finally {
        if (browser) await browser.close();
        fs.remove(folderPath).catch(err => console.error(err));
    }
});

// Nota: En Vercel, app.listen no es estrictamente necesario pero ayuda en local
if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
