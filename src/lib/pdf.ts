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

        // Pain point box
        doc.setDrawColor(192, 192, 192); // Gray border
        doc.setFillColor(245, 245, 245); // Light gray background
        const boxHeight = 20;
        doc.rect(margin, yPosition, maxWidth, boxHeight, 'FD');

        // Issue
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(pain.issue, margin + 2, yPosition + 5);

        // Metrics
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Frequency: ${pain.frequency}%`, maxWidth - 30, yPosition + 5);
        doc.text(`Urgency: ${pain.urgency}%`, maxWidth - 30, yPosition + 10);

        // Context
        doc.setFontSize(9);
        const contextLines = doc.splitTextToSize(pain.context, maxWidth - 10);
        doc.text(contextLines[0] || '', margin + 2, yPosition + 11);
        if (contextLines.length > 1) {
          doc.text(contextLines[1] || '', margin + 2, yPosition + 16);
        }

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

        // Idea box
        doc.setDrawColor(0, 128, 128); // Teal border
        doc.setFillColor(240, 248, 255); // Light blue background
        const boxStartY = yPosition;

        // Idea title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(idea.idea, maxWidth - 30);
        doc.text(titleLines[0] || '', margin + 2, yPosition + 5);

        // Viability badge
        doc.setFillColor(0, 128, 0); // Green
        doc.rect(maxWidth - 18, yPosition + 1, 16, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`${idea.viability}%`, maxWidth - 10, yPosition + 5, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        yPosition += 10;

        // Details
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        // Target market
        const targetLines = doc.splitTextToSize(`Target: ${idea.targetMarket}`, maxWidth - 10);
        doc.text(targetLines[0] || '', margin + 2, yPosition);
        yPosition += 5;

        // Revenue potential
        const revenueLines = doc.splitTextToSize(`Revenue: ${idea.potentialRevenue}`, maxWidth - 10);
        doc.text(revenueLines[0] || '', margin + 2, yPosition);
        yPosition += 5;

        // Addresses
        const addressesText = `Addresses: ${idea.painPointsAddressed.join(', ')}`;
        const addressLines = doc.splitTextToSize(addressesText, maxWidth - 10);
        for (let j = 0; j < Math.min(2, addressLines.length); j++) {
          doc.text(addressLines[j], margin + 2, yPosition);
          yPosition += 4;
        }

        const boxHeight = yPosition - boxStartY + 2;
        doc.rect(margin, boxStartY, maxWidth, boxHeight, 'D');
        yPosition += 5;
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