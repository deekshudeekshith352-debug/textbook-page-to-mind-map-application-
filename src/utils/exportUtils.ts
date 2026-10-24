import { jsPDF } from 'jspdf';
import { MindMapData } from '../types/mindmap';
import { LayoutedNode } from './graphLayout';

/**
 * Export mind map data as formatted JSON
 */
export function exportToJSON(data: MindMapData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.replace(/\s+/g, '_')}_MindMap.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export the mind map SVG element as a standalone SVG file
 */
export function exportToSVG(svgElement: SVGSVGElement, title: string) {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add namespaces if missing
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  // Prepend XML declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}_MindMap.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export SVG element to high-resolution PNG image
 */
export function exportToPNG(svgElement: SVGSVGElement, title: string, scale = 2) {
  if (!svgElement) return;

  const bbox = svgElement.getBBox();
  const width = Math.max(bbox.width + 120, 1200);
  const height = Math.max(bbox.height + 120, 800);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(scale, scale);
    ctx.drawImage(image, 60, 60);

    URL.revokeObjectURL(blobURL);

    const a = document.createElement('a');
    a.download = `${title.replace(/\s+/g, '_')}_MindMap.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
  };
  image.src = blobURL;
}

/**
 * Export comprehensive PDF Study Guide containing Mind Map outline, key definitions, formulas, and flashcards
 */
export function exportToPDF(data: MindMapData, nodes: LayoutedNode[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('MindMap AI Pro — Comprehensive Study Brief', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Subject: ${data.subject || 'Academic'}`, 14, 22);

  y = 38;

  // Title & Chapter
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title, 14, y);
  y += 6;

  if (data.chapter) {
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(data.chapter, 14, y);
    y += 8;
  }

  // Overview box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const overviewLines = doc.splitTextToSize(`Overview: ${data.overview}`, pageWidth - 36);
  doc.text(overviewLines, 18, y + 6);
  y += 28;

  // Key Takeaways
  if (data.keyTakeaways && data.keyTakeaways.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Takeaways', 14, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    data.keyTakeaways.slice(0, 5).forEach((t) => {
      doc.text(`• ${t}`, 18, y);
      y += 5.5;
    });
    y += 4;
  }

  // Mind Map Hierarchical Outline
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Mind Map Hierarchical Nodes', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  nodes.slice(0, 15).forEach((node) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const indent = Math.min(node.depth * 6, 24);
    doc.setTextColor(79, 70, 229);
    doc.text(`[${node.type.toUpperCase()}]`, 14 + indent, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(node.title, 36 + indent, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(node.summary, pageWidth - 42 - indent);
    doc.text(summaryLines, 36 + indent, y);
    y += summaryLines.length * 4.2 + 2;
  });

  // Important Definitions
  if (data.definitions && data.definitions.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    } else {
      y += 6;
    }

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Terminology & Definitions', 14, y);
    y += 6;

    data.definitions.forEach((d) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${d.term}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const defLines = doc.splitTextToSize(d.definition, pageWidth - 28);
      doc.text(defLines, 14, y + 4.5);
      y += defLines.length * 4.5 + 4;
    });
  }

  // Formulas
  if (data.formulas && data.formulas.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    } else {
      y += 6;
    }

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Formulas & Mathematical Laws', 14, y);
    y += 6;

    data.formulas.forEach((f) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${f.name}:  ${f.formula}`, 14, y);
      y += 5;
      if (f.notes) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(f.notes, 18, y);
        y += 5;
      }
    });
  }

  doc.save(`${data.title.replace(/\s+/g, '_')}_Study_Guide.pdf`);
}
