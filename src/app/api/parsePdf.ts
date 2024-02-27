import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
pdfjs.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.js';

export async function parsePdf(file: File) {
    const fileURL = URL.createObjectURL(file);
    const pdf = await pdfjs.getDocument(fileURL).promise;
    URL.revokeObjectURL(fileURL); // Clean up the URL object after use
    const numPages = pdf.numPages;
    const allText = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items
            .filter((item): item is TextItem => (item as TextItem).str !== undefined)
            .map((item) => item.str);
        allText.push(textItems.join(' '));
    }

    return allText.join('\n');
}