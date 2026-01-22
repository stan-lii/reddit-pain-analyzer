import jsPDF from 'jspdf';
import { Analysis, PainPoint, BusinessIdea } from './types';

export async function generatePDF(analysis: Analysis[]): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const addWrappedText = (
    text: string,
    x: number,
    fontSize: number = 10,
    fontStyle: string = 'normal'
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth - (x - margin));

    for (const line of lines) {
      checkPageBreak();
      doc.text(line, x, yPosition);
      yPosition += fontSize * 0.5;
    }
  };

  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Reddit Pain Point Analysis', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generated on ${date}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Analysis for each keyword
  for (let i = 0; i < analysis.length; i++) {
    const item = analysis[i];

    checkPageBreak(30);

    // Keyword header
    doc.setFillColor(0, 0, 128); // Windows 98 blue
    doc.rect(margin, yPosition - 5, maxWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Keyword: ${item.keyword}`, margin + 2, yPosition + 2);
    doc.setTextColor(0, 0, 0);
    yPosition += 15;

    // Summary
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += 7;
    addWrappedText(item.summary, margin, 10, 'normal');
    yPosition += 10;

    // Pain Points
    if (item.painPoints.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Pain Points (${item.painPoints.length})`, margin, yPosition);
      yPosition += 7;

      // Sort pain points by severity
      const sortedPainPoints = [...item.painPoints].sort(
        (a, b) => (b.frequency + b.urgency) - (a.frequency + a.urgency)
      );

      for (const pain of sortedPainPoints) {
        checkPageBreak(25);

        const boxStartY = yPosition;
        let boxContentY = yPosition + 3; // Top padding

        // Calculate widths
        const contentWidth = maxWidth - 4; // Full width with padding

        // Issue text (bold, multi-line)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const issueLines = doc.splitTextToSize(pain.issue, contentWidth);

        // Context text (normal, max 3 lines)
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const contextLines = doc.splitTextToSize(pain.context, contentWidth);

        // Calculate heights
        const issueHeight = issueLines.length * 5;
        const contextHeight = Math.min(contextLines.length, 3) * 4.5;
        const metricsHeight = 5;
        const boxHeight = 3 + issueHeight + 2 + contextHeight + 2 + metricsHeight + 3;

        // Draw box background
        doc.setDrawColor(192, 192, 192); // Gray border
        doc.setFillColor(245, 245, 245); // Light gray background
        doc.rect(margin, boxStartY, maxWidth, boxHeight, 'FD');

        // Render issue
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        for (const line of issueLines) {
          doc.text(line, margin + 2, boxContentY);
          boxContentY += 5;
        }
        boxContentY += 2;

        // Render context
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        for (let i = 0; i < Math.min(3, contextLines.length); i++) {
          doc.text(contextLines[i], margin + 2, boxContentY);
          boxContentY += 4.5;
        }
        boxContentY += 2;

        // Render metrics badges at bottom (inline)
        doc.setFontSize(8);
        doc.setFillColor(100, 100, 180);
        doc.rect(margin + 2, boxContentY - 3, 28, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`Freq: ${pain.frequency}%`, margin + 3.5, boxContentY);

        doc.setFillColor(180, 100, 100);
        doc.rect(margin + 32, boxContentY - 3, 28, 5, 'F');
        doc.text(`Urg: ${pain.urgency}%`, margin + 33.5, boxContentY);
        doc.setTextColor(0, 0, 0);

        yPosition += boxHeight + 5;
      }

      yPosition += 5;
    }

    // Business Ideas
    if (item.businessIdeas.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Business Ideas (${item.businessIdeas.length})`, margin, yPosition);
      yPosition += 7;

      // Sort business ideas by viability
      const sortedIdeas = [...item.businessIdeas].sort((a, b) => b.viability - a.viability);

      for (const idea of sortedIdeas) {
        checkPageBreak(30);

        const boxStartY = yPosition;
        let boxContentY = yPosition + 4; // Top padding

        const contentWidth = maxWidth - 4;

        // Title (multi-line, bold)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(idea.idea, contentWidth);

        // Details text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const targetLines = doc.splitTextToSize(`Target: ${idea.targetMarket}`, contentWidth);
        const revenueLines = doc.splitTextToSize(`Revenue: ${idea.potentialRevenue}`, contentWidth);
        const addressesText = `Addresses: ${idea.painPointsAddressed.join(', ')}`;
        const addressLines = doc.splitTextToSize(addressesText, contentWidth);

        // Calculate heights
        const titleHeight = titleLines.length * 5;
        const badgeHeight = 5;
        const targetHeight = Math.min(targetLines.length, 2) * 4.5;
        const revenueHeight = Math.min(revenueLines.length, 2) * 4.5;
        const addressHeight = Math.min(addressLines.length, 2) * 4.5;
        const boxHeight = 4 + titleHeight + 2 + badgeHeight + targetHeight + revenueHeight + addressHeight + 3;

        // Draw box background FIRST
        doc.setDrawColor(0, 128, 128); // Teal border
        doc.setFillColor(240, 248, 255); // Light blue background
        doc.rect(margin, boxStartY, maxWidth, boxHeight, 'FD');

        // Render title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        for (const line of titleLines) {
          doc.text(line, margin + 2, boxContentY);
          boxContentY += 5;
        }
        boxContentY += 2;

        // Viability badge (below title)
        doc.setFillColor(0, 128, 0); // Green
        const badgeWidth = 22;
        doc.rect(margin + 2, boxContentY - 3, badgeWidth, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`${idea.viability}% viable`, margin + 13, boxContentY, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        boxContentY += 5;

        // Details
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        // Target market
        for (const line of targetLines.slice(0, 2)) {
          doc.text(line, margin + 2, boxContentY);
          boxContentY += 4.5;
        }

        // Revenue potential
        for (const line of revenueLines.slice(0, 2)) {
          doc.text(line, margin + 2, boxContentY);
          boxContentY += 4.5;
        }

        // Addresses
        for (const line of addressLines.slice(0, 2)) {
          doc.text(line, margin + 2, boxContentY);
          boxContentY += 4.5;
        }

        yPosition = boxContentY + 5;
      }
    }

    // Add spacing between keywords
    yPosition += 10;
  }

  // Footer on last page
  checkPageBreak(15);
  yPosition = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    'Generated by Reddit Pain Point Analyzer - Windows 98 Edition',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  // Download the PDF
  const filename = `reddit-analysis-${Date.now()}.pdf`;
  doc.save(filename);
}