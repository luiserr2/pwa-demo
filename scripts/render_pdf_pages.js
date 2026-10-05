const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderPdfToImages(pdfRelativePath, outputFolder) {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  const pdfjsHtml = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <canvas id="the-canvas"></canvas>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    let pdfDoc = null;
    async function loadPdf(base64) {
      const loadingTask = pdfjsLib.getDocument({ data: atob(base64) });
      pdfDoc = await loadingTask.promise;
      return pdfDoc.numPages;
    }
    async function renderPage(num) {
      const p = await pdfDoc.getPage(num);
      const viewport = p.getViewport({ scale: 2.0 });
      const canvas = document.getElementById('the-canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await p.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL('image/png');
    }
  </script>
</body>
</html>`;

  await page.setContent(pdfjsHtml);

  const pdfFullPath = path.resolve(pdfRelativePath);
  if (!fs.existsSync(pdfFullPath)) {
    console.error('PDF does not exist:', pdfFullPath);
    await browser.close();
    return;
  }
  const pdfBytes = fs.readFileSync(pdfFullPath);
  const base64 = pdfBytes.toString('base64');

  const numPages = await page.evaluate(async (b64) => {
    return await window.loadPdf(b64);
  }, base64);

  console.log('Total pages in PDF:', numPages);

  const outDir = path.resolve(outputFolder);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 1; i <= numPages; i++) {
    const dataUrl = await page.evaluate(async (pageNum) => {
      return await window.renderPage(pageNum);
    }, i);
    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
    const pagePath = path.join(outDir, `page_${i}.png`);
    fs.writeFileSync(pagePath, buffer);
    console.log(`Rendered page ${i} to ${pagePath}`);
  }

  await browser.close();
}

async function convertHtmlToPdf(htmlRelativePath, pdfRelativePath) {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();
  const htmlFullPath = path.resolve(htmlRelativePath);
  await page.goto('file:///' + htmlFullPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });

  const pdfFullPath = path.resolve(pdfRelativePath);
  await page.pdf({
    path: pdfFullPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
  });
  console.log('Saved PDF to:', pdfFullPath);
  await browser.close();
}

async function main() {
  const htmlPath = process.argv[2] || 'docs/PROPUESTA_COMERCIAL_SISBIR.html';
  const pdfPath = process.argv[3] || 'docs/PROPUESTA_COMERCIAL_SISBIR.pdf';
  const outDir = process.argv[4] || 'docs/pdf_pages';

  console.log('Converting HTML to PDF...');
  await convertHtmlToPdf(htmlPath, pdfPath);
  console.log('Rendering PDF to images...');
  await renderPdfToImages(pdfPath, outDir);
}

main().catch(console.error);
