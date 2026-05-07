import { jsPDF } from 'jspdf';

/**
 * Download chat as a plain text file.
 * @param {Array} messages - [{role, content}]
 * @param {string} filename
 */
export function exportAsTxt(messages, filename = 'lumina-chat.txt') {
  const lines = messages
    .filter(m => m.id !== 'init')
    .map(m => {
      const label = m.role === 'user' ? 'You' : 'Lumina AI';
      return `[${label}]\n${m.content}\n`;
    })
    .join('\n---\n\n');

  const header = `LUMINA AI — Chat Export\nExported: ${new Date().toLocaleString()}\n\n${'='.repeat(50)}\n\n`;
  const blob = new Blob([header + lines], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download chat as a PDF file.
 * @param {Array} messages
 * @param {string} filename
 */
export function exportAsPdf(messages, filename = 'lumina-chat.pdf') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFillColor(70, 72, 212);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LUMINA AI — Chat Export', margin, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleString(), pageWidth - margin - 40, 14);

  y = 32;

  messages
    .filter(m => m.id !== 'init')
    .forEach((msg) => {
      const isUser = msg.role === 'user';
      const label = isUser ? 'You' : 'Lumina AI';

      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isUser ? 70 : 129, isUser ? 72 : 39, isUser ? 212 : 207);
      doc.text(label, margin, y);
      y += 5;

      // Message text
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 50);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(msg.content, maxWidth);
      lines.forEach((line) => {
        if (y > 275) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5.5;
      });

      // Divider
      y += 3;
      doc.setDrawColor(220, 220, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    });

  doc.save(filename);
}
