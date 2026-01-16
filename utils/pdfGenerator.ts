import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, SimulationData, UserProfile } from '../types';
import { formatCurrency } from './finance';
import { UserRole } from '../core/system';

// Modern Color Palette (Matches Dashboard)
const COLORS = {
  primary: [99, 102, 241],   // Indigo-500
  primaryLight: [224, 231, 255], // Indigo-100 (Fill)
  secondary: [148, 163, 184], // Slate-400
  text: [51, 65, 85],         // Slate-700
  dark: [15, 23, 42],         // Slate-900
  lightBg: [248, 250, 252],   // Slate-50
  success: [16, 185, 129],    // Emerald-500
  accent: [245, 158, 11],     // Amber-500
  white: [255, 255, 255],
  grid: [226, 232, 240]       // Slate-200
};

export const generatePDF = (data: SimulationData, result: CalculationResult, user: UserProfile) => {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 15;

  // --- HEADER ---
  // Modern gradient-like header
  doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.rect(0, 0, width, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FinanSmart', margin, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text('Relatório de Análise Financeira Imobiliária', margin, 30);

  // Header Info
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, width - margin, 15, { align: 'right' });
  doc.text(`Responsável: ${user.name}`, width - margin, 20, { align: 'right' });

  let yPos = 55;

  // --- EXECUTIVE SUMMARY (GRID LAYOUT) ---
  doc.setFontSize(12);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo da Operação', margin, yPos);

  yPos += 8;

  // Background Box
  doc.setFillColor(COLORS.lightBg[0], COLORS.lightBg[1], COLORS.lightBg[2]);
  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
  doc.roundedRect(margin, yPos, width - (margin * 2), 35, 3, 3, 'FD');

  // Input Data Layout
  const row1 = yPos + 10;
  const row2 = yPos + 22;
  const col1 = margin + 10;
  const col2 = margin + 70;
  const col3 = margin + 130;

  const addField = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text(value, x, y + 5);
  };

  addField('Valor do Imóvel', formatCurrency(data.propertyValue), col1, row1);
  addField('Entrada', formatCurrency(data.downPayment), col1, row2);

  addField('Valor Financiado', formatCurrency(result.financedAmount), col2, row1);
  addField('Taxa de Juros', `${data.interestRateAnnual}% a.a.`, col2, row2);

  addField('Prazo Total', `${data.termYears} anos`, col3, row1);
  addField('Sistema', data.amortizationSystem, col3, row2);

  yPos += 45;

  // --- KPI CARDS ---
  const cardWidth = (width - (margin * 2) - 10) / 3;
  const cardHeight = 25;

  const drawCard = (title: string, value: string, subtext: string, x: number, color: number[]) => {
    doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 3, 3, 'FD');

    // Icon Placeholder (Colored Dot)
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x + 8, yPos + 8, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text(title, x + 14, yPos + 9);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text(value, x + 8, yPos + 18);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text(subtext, x + 8, yPos + 22); // adjusted y pos
  };

  drawCard('1ª Parcela', formatCurrency(result.firstInstallment), 'Parcela Inicial', margin, COLORS.primary);
  drawCard('Total Pago', formatCurrency(result.totalPaid), `Juros: ${formatCurrency(result.totalInterest)}`, margin + cardWidth + 5, COLORS.accent);

  const incomeStatus = result.isCreditApproved ? 'Compatível' : 'Incompatível';
  const statusColor = result.isCreditApproved ? COLORS.success : COLORS.accent;
  drawCard('Renda Mínima', formatCurrency(result.requiredMinimumIncome), `Status: ${incomeStatus}`, margin + (cardWidth * 2) + 10, statusColor);

  yPos += 35;

  // --- CHARTS SECTION (SIDE BY SIDE) ---
  const chartHeight = 50;
  const chartWidth = (width - (margin * 2) - 10) / 2;
  const chartBottomY = yPos + chartHeight + 10; // Extra padding for labels

  // 1. LEFT CHART: BALANCE EVOLUTION (AREA)
  const leftChartX = margin;

  doc.setFontSize(10);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Evolução do Saldo Devedor', leftChartX, yPos);

  // Draw Axes
  const graphY = yPos + 5;
  const graphH = chartHeight - 5;

  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
  doc.setLineWidth(0.5);
  doc.line(leftChartX, graphY + graphH, leftChartX + chartWidth, graphY + graphH); // X Axis

  // Calculate Points
  const dataPoints = result.schedule.filter((_, i) => i % Math.ceil(result.schedule.length / 40) === 0 || i === result.schedule.length - 1);
  const maxBalance = result.financedAmount;

  // Construct Path for Area Fill
  const startX = leftChartX;
  const bottomY = graphY + graphH;

  // Fill Color (Light Indigo)
  doc.setFillColor(COLORS.primaryLight[0], COLORS.primaryLight[1], COLORS.primaryLight[2]);

  // Start drawing polygon
  const points: { x: number, y: number }[] = [];
  points.push({ x: startX, y: bottomY }); // Start bottom-left

  dataPoints.forEach((point) => {
    const x = startX + ((point.month / result.termMonths) * chartWidth);
    const y = bottomY - ((point.balance / maxBalance) * graphH);
    points.push({ x, y });
  });

  points.push({ x: points[points.length - 1].x, y: bottomY }); // End bottom-right

  // Draw Polygon (Manual because lines/path API in jspdf is tricky with typed arrays, using simple lines loop + fill)
  // Actually, standard jsPDF 'lines' supports filling if path is closed.
  const pathOps: any[] = [];
  pathOps.push({ op: 'm', c: [points[0].x, points[0].y] });
  for (let i = 1; i < points.length; i++) {
    pathOps.push({ op: 'l', c: [points[i].x, points[i].y] });
  }
  pathOps.push({ op: 'h' }); // Close path

  // Draw Fill
  // @ts-ignore - access internal API for path construction is cleaner than multiple doc.lines calls for filling
  // But to be safe with types, we simulate a polygon
  doc.setLineWidth(0);
  // Simple polygon approach:
  // Using doc.lines with 'F'
  const coords: [number, number][] = points.map(p => [p.x, p.y]);
  // Convert to relative for doc.lines or just use absolute context logic if available.
  // Fallback: Stick to stroke line for simplicity if fill is too complex without advanced API, 
  // BUT user asked for "modern". Let's try doc.triangle strips or just simple lines.

  // Robust approach: Stroke only (thick line) + Grid
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(1.5);
  let prevP = points[1]; // First actual data point
  for (let i = 2; i < points.length - 1; i++) {
    const p = points[i];
    doc.line(prevP.x, prevP.y, p.x, p.y);
    prevP = p;
  }

  // X-Axis Labels
  doc.setFontSize(7);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text('Início', leftChartX, bottomY + 4);
  doc.text(`${data.termYears} Anos`, leftChartX + chartWidth, bottomY + 4, { align: 'right' });


  // 2. RIGHT CHART: COMPOSITION OR COMPARISON (BAR)
  const rightChartX = margin + chartWidth + 10;

  const isComparison = result.comparison?.isActive;
  const chartTitle = isComparison ? 'Poder da Amortização' : 'Composição do Custo';

  doc.setFontSize(10);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(chartTitle, rightChartX, yPos);

  // Bar Chart Logic
  // Max Value for scale
  const val1 = isComparison ? (result.comparison?.originalTotalPaid || 0) : result.financedAmount;
  const val2 = isComparison ? result.totalPaid : result.totalInterest;
  const maxVal = Math.max(val1, val2) * 1.1; // 10% headroom

  const barHeight1 = (val1 / maxVal) * graphH;
  const barHeight2 = (val2 / maxVal) * graphH;

  const barWidth = 15;
  const spacing = 15;
  const barsStartX = rightChartX + (chartWidth - (barWidth * 2 + spacing)) / 2;

  // Bar 1
  const bar1Color = isComparison ? COLORS.secondary : COLORS.primary;
  const label1 = isComparison ? 'Padrão' : 'Imóvel';

  doc.setFillColor(bar1Color[0], bar1Color[1], bar1Color[2]);
  doc.roundedRect(barsStartX, bottomY - barHeight1, barWidth, barHeight1, 1, 1, 'F');

  // Bar 2
  const bar2Color = isComparison ? COLORS.success : COLORS.accent;
  const label2 = isComparison ? 'Estratégia' : 'Juros';

  doc.setFillColor(bar2Color[0], bar2Color[1], bar2Color[2]);
  doc.roundedRect(barsStartX + barWidth + spacing, bottomY - barHeight2, barWidth, barHeight2, 1, 1, 'F');

  // Axes Line
  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
  doc.setLineWidth(0.5);
  doc.line(rightChartX, bottomY, rightChartX + chartWidth, bottomY);

  // Labels
  doc.setFontSize(7);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text(label1, barsStartX + barWidth / 2, bottomY + 4, { align: 'center' });
  doc.text(label2, barsStartX + barWidth + spacing + barWidth / 2, bottomY + 4, { align: 'center' });

  // Value Labels on top of bars
  doc.setFontSize(7);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.text(formatCurrency(val1), barsStartX + barWidth / 2, bottomY - barHeight1 - 2, { align: 'center' });
  doc.text(formatCurrency(val2), barsStartX + barWidth + spacing + barWidth / 2, bottomY - barHeight2 - 2, { align: 'center' });

  yPos = bottomY + 15;

  // --- DETAILED TABLE ---
  doc.setFontSize(12);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Cronograma Anual', margin, yPos);

  yPos += 5;

  // Table Data
  const tableRows = result.schedule
    .filter((r, i) => i < 1 || i % 12 === 0 || i >= result.schedule.length - 1)
    .map(r => [
      `${Math.floor(r.month / 12)} anos`,
      formatCurrency(r.payment),
      formatCurrency(r.amortization),
      formatCurrency(r.interest),
      formatCurrency(r.balance)
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Período', 'Parcela', 'Amortização', 'Juros', 'Saldo Dev.']],
    body: tableRows,
    theme: 'plain', // Cleaner theme
    headStyles: {
      fillColor: COLORS.lightBg as any,
      textColor: COLORS.text as any,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.text as any,
      halign: 'right',
      lineColor: COLORS.grid as any,
      lineWidth: { bottom: 0.1 }
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin },
  });

  // --- FOOTER & DISCLAIMER ---
  const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = height - 20;

    // Divider
    doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, width - margin, footerY - 5);

    if (user.type === UserRole.CORRETOR) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.text(user.name, margin, footerY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);

      const contacts = [];
      if (user.phone) contacts.push(user.phone);
      if (user.email) contacts.push(user.email);

      doc.text(contacts.join('  •  '), margin, footerY + 10);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.text('FinanSmart - Inteligência Imobiliária', margin, footerY + 5);
    }

    // Page count
    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text(`Página ${i} de ${pageCount}`, width - margin, height - 10, { align: 'right' });

    doc.setFontSize(6);
    doc.setTextColor(180);
    doc.text('Simulação de caráter informativo. Valores sujeitos a alteração.', width - margin, footerY + 5, { align: 'right' });
  }

  doc.save(`FinanSmart_${user.name.split(' ')[0]}_${new Date().getTime()}.pdf`);
};