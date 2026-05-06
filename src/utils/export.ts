import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CanvasNode, CanvasEdge } from '../types';

/**
 * Captures the canvas as an image or PDF
 */
const captureCanvas = async (nodes: CanvasNode[], edges: CanvasEdge[], title: string, backgroundColor: string = '#05070A') => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '-10000px';
  container.style.width = '2000px';
  container.style.height = '1200px';
  container.style.background = backgroundColor;
  container.style.padding = '80px';
  container.style.overflow = 'hidden';
  container.style.fontFamily = "'Geist', sans-serif";

  // Title
  const titleEl = document.createElement('h1');
  titleEl.innerText = title;
  titleEl.style.fontSize = '36px';
  titleEl.style.color = backgroundColor === '#ffffff' ? '#000' : '#fff';
  titleEl.style.marginBottom = '40px';
  titleEl.style.borderBottom = `2px solid ${backgroundColor === '#ffffff' ? '#000' : 'rgba(255,255,255,0.1)'}`;
  titleEl.style.paddingBottom = '10px';
  container.appendChild(titleEl);

  const canvas = document.createElement('div');
  canvas.style.position = 'relative';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  // Nodes
  nodes.forEach(node => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    el.style.width = `${node.width || 160}px`;
    el.style.height = `${node.height || 60}px`;
    el.style.background = node.type === 'text' ? 'transparent' : (node.color || '#6045F4');
    el.style.border = node.type === 'text' ? 'none' : '1px solid rgba(255,255,255,0.2)';
    el.style.borderRadius = node.type === 'text' ? '0' : '10px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.color = '#fff';
    el.style.fontWeight = '600';
    el.style.fontSize = `${node.fontSize || 12}px`;
    el.style.textAlign = 'center';
    el.innerText = node.label;
    canvas.appendChild(el);
  });

  // SVG Edges
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;');
  canvas.appendChild(svg);

  edges.forEach(edge => {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);
    if (!from || !to) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const x1 = from.x + (from.width || 160) / 2;
    const y1 = from.y + (from.height || 60) / 2;
    const x2 = to.x + (to.width || 160) / 2;
    const y2 = to.y + (to.height || 60) / 2;
    
    path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
    path.setAttribute('stroke', backgroundColor === '#ffffff' ? '#000' : 'rgba(255,255,255,0.4)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
  });

  document.body.appendChild(container);
  const result = await html2canvas(container, { scale: 2, backgroundColor });
  document.body.removeChild(container);
  return result;
};

export const exportToPNG = async (nodes: CanvasNode[], edges: CanvasEdge[], title: string) => {
  const canvas = await captureCanvas(nodes, edges, title);
  const link = document.createElement('a');
  link.download = `${title.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const exportToPDF = async (nodes: CanvasNode[], edges: CanvasEdge[], title: string) => {
  const canvas = await captureCanvas(nodes, edges, title, '#ffffff');
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToSVG = (nodes: CanvasNode[], edges: CanvasEdge[], title: string) => {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1200" viewBox="0 0 2000 1200">
    <rect width="100%" height="100%" fill="#05070A" />
    <text x="80" y="80" font-family="Arial" font-size="36" fill="#fff">${title}</text>`;

  edges.forEach(edge => {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);
    if (!from || !to) return;
    const x1 = from.x + (from.width || 160) / 2;
    const y1 = from.y + (from.height || 60) / 2;
    const x2 = to.x + (to.width || 160) / 2;
    const y2 = to.y + (to.height || 60) / 2;
    svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.4)" stroke-width="2" />`;
  });

  nodes.forEach(node => {
    svgContent += `<rect x="${node.x}" y="${node.y}" width="${node.width || 160}" height="${node.height || 60}" rx="10" fill="${node.color || '#6045F4'}" stroke="rgba(255,255,255,0.2)" />
    <text x="${node.x + (node.width || 160) / 2}" y="${node.y + (node.height || 60) / 2 + 5}" font-family="Arial" font-size="12" fill="#fff" text-anchor="middle">${node.label}</text>`;
  });

  svgContent += '</svg>';
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${title.replace(/\s+/g, '_')}.svg`;
  link.href = url;
  link.click();
};
