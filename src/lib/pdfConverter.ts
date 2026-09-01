import * as pdfjsLib from 'pdfjs-dist';

// Configure standard pdfjs worker from cdnjs or dynamic import
if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface PdfConversionResult {
  base64Frames: string[];
  extractedText: string;
}

/**
 * Converts a PDF file into an array of base64 JPEG image strings and extracted text
 */
export async function convertPdfToPayload(file: File): Promise<PdfConversionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, 6); // Up to 6 pages
    const base64Frames: string[] = [];
    let extractedText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Extract text
      try {
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        extractedText += `\n[--- PAGE ${pageNum} ---]\n` + pageText;
      } catch (tErr) {
        console.warn(`Text extraction skipped for page ${pageNum}:`, tErr);
      }

      // Render image frame
      const viewport = page.getViewport({ scale: 2.0 }); // 200 DPI equivalent
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Draw white background
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext as any).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      base64Frames.push(dataUrl);
    }

    return {
      base64Frames,
      extractedText: extractedText.trim(),
    };
  } catch (err) {
    console.warn('PDF conversion fallback error:', err);
    return {
      base64Frames: [],
      extractedText: '',
    };
  }
}

/**
 * Backward compatibility wrapper
 */
export async function convertPdfToBase64Images(file: File): Promise<string[]> {
  const result = await convertPdfToPayload(file);
  return result.base64Frames;
}

