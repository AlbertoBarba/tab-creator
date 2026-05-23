import { Song, Measure } from '../types/tab';

export interface PDFLayoutMeasure {
  measure: Measure;
  x: number;
  y: number;
}

export interface PDFLayoutPage {
  measures: PDFLayoutMeasure[];
  height: number;
}

export const paginateSong = (
  song: Song, 
  maxMeasuresPerRow: number = 4, 
  rowsPerPage: number = 6,
  measureWidth: number = 133,
  measureHeight: number = 110,
  initialY: number = 0
): PDFLayoutPage[] => {
  const pages: PDFLayoutPage[] = [];
  
  let currentRowIndex = 0;
  let currentColIndex = 0;
  let currentRowHasLabel = false;
  let currentPageMeasures: PDFLayoutMeasure[] = [];
  let currentY = initialY;
  let maxPageY = 0;

  song.measures.forEach((measure) => {
    // Force new row if measure has a label and current row is not empty
    if (measure.label && currentColIndex !== 0) {
      currentRowIndex++;
      currentColIndex = 0;
    }
    
    if (currentColIndex === 0) {
      currentRowHasLabel = !!measure.label;
    }

    // Check if we need a new page
    if (currentRowIndex >= rowsPerPage) {
      pages.push({ measures: currentPageMeasures, height: maxPageY + 20 });
      currentPageMeasures = [];
      currentRowIndex = 0;
      currentColIndex = 0;
      currentY = 0; // Subsequent pages don't have the header offset
      maxPageY = 0;
      currentRowHasLabel = !!measure.label;
    }

    const x = currentColIndex * measureWidth;
    const y = currentY + currentRowIndex * measureHeight + (currentRowHasLabel ? 25 : 0);
    
    maxPageY = Math.max(maxPageY, y + measureHeight);

    currentPageMeasures.push({ measure, x, y });
    
    currentColIndex++;
    if (currentColIndex >= maxMeasuresPerRow) {
      currentRowIndex++;
      currentColIndex = 0;
    }
  });
  
  if (currentPageMeasures.length > 0) {
    pages.push({ measures: currentPageMeasures, height: maxPageY + 20 });
  }
  
  return pages;
};
