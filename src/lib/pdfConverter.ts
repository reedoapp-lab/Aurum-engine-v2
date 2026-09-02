import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Worker configuration notice:', e);
  }
}

export interface PdfExtractionResult {
  base64Pdf: string;
  extractedText: string;
  pageImages: string[];
  pageCount: number;
}

/**
 * Converts a File or Blob into base64 raw string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a PDF thoroughly: extracts full text per page and renders high-res visual frames
 */
export async function readPdfThoroughly(file: File): Promise<PdfExtractionResult> {
  const base64Pdf = await fileToBase64(file);
  let extractedText = '';
  const pageImages: string[] = [];
  let pageCount = 1;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableFontFace: false,
    });
    const pdf = await loadingTask.promise;
    pageCount = pdf.numPages;
    const maxPagesToProcess = Math.min(pageCount, 10);

    for (let pageNum = 1; pageNum <= maxPagesToProcess; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // 1. Extract raw text with layout & lines
      try {
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let pageLines = '';

        for (const item of textContent.items as any[]) {
          if (item && item.str) {
            const currentY = item.transform ? item.transform[5] : null;
            if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
              pageLines += '\n' + item.str;
            } else {
              pageLines += (pageLines.endsWith(' ') || pageLines.endsWith('\n') ? '' : ' ') + item.str;
            }
            lastY = currentY;
          }
        }

        extractedText += `\n--- PAGE ${pageNum} ---\n` + pageLines;
      } catch (tErr) {
        console.warn(`Text extraction page ${pageNum} warning:`, tErr);
      }

      // 2. Render vision canvas frame
      try {
        const viewport = page.getViewport({ scale: 2.0 }); // High-res 200 DPI
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);

          await (page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          } as any).promise);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          pageImages.push(dataUrl);
        }
      } catch (rErr) {
        console.warn(`Frame render page ${pageNum} warning:`, rErr);
      }
    }
  } catch (err) {
    console.warn('PDF detailed extraction warning:', err);
  }

  return {
    base64Pdf,
    extractedText: extractedText.trim(),
    pageImages,
    pageCount,
  };
}

/**
 * Legacy wrapper for backward compatibility with existing components
 */
export async function convertPdfToBase64Images(file: File): Promise<string[]> {
  const res = await readPdfThoroughly(file);
  return res.pageImages;
}
