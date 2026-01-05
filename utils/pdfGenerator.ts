import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, SimulationData, UserProfile } from '../types';
import { formatCurrency } from './finance';

// Helper colors
const COLORS = {
  primary: [37, 99, 235], // Blue-600
  secondary: [30, 41, 59], // Slate-800
  text: [71, 85, 105], // Slate-600
  lightBg: [248, 250, 252], // Slate-50
  success: [16, 185, 129], // Emerald-500
  successBg: [236, 253, 245], // Emerald-50
  accent: [245, 158, 11], // Amber-500
  white: [255, 255, 255],
  grid: [226, 232, 240] // Slate-200
};

export const generatePDF = (data: SimulationData, result: CalculationResult, user: UserProfile) => {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // --- HEADER ---
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, width, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FinanSmart', margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Análise Financeira Imobiliária', margin, 30);
  
  // Header Info
  doc.setFontSize(9);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, width - margin, 15, { align: 'right' });
  doc.text(`Cliente: ${user.type === 'CLIENTE' ? user.name : 'Potencial Cliente'}`, width - margin, 20, { align: 'right' });

  let yPos = 55;

  // --- EXECUTIVE SUMMARY (GRID LAYOUT) ---
  doc.setFontSize(12);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo da Operação', margin, yPos);
  
  yPos += 8;
  
  // Draw background box for inputs
  doc.setFillColor(COLORS.lightBg[0], COLORS.lightBg[1], COLORS.lightBg[2]);
  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
  doc.roundedRect(margin, yPos, width - (margin * 2), 35, 2, 2, 'FD');
  
  // Column layout for data fields
  const row1 = yPos + 10;
  const row2 = yPos + 22;
  const col1 = margin + 10;
  const col2 = margin + 70;
  const col3 = margin + 130;

  // Helper to add fields
  const addField = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(label, x, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.text(value, x, y + 5);
  };

  addField('Valor do Imóvel', formatCurrency(data.propertyValue), col1, row1);
  addField('Entrada', formatCurrency(data.downPayment), col1, row2);
  
  addField('Valor Financiado', formatCurrency(result.financedAmount), col2, row1);
  addField('Taxa de Juros', `${data.interestRateAnnual}% a.a.`, col2, row2);
  
  addField('Prazo', `${data.termYears} anos`, col3, row1);
  addField('Sistema', data.amortizationSystem, col3, row2);

  yPos += 45;

  // --- KEY FINANCIAL INDICATORS (CARDS) ---
  const cardWidth = (width - (margin * 2) - 10) / 3;
  const cardHeight = 30;
  
  const drawCard = (title: string, value: string, subtext: string, x: number, highlight = false) => {
    if (highlight) {
      doc.setFillColor(COLORS.successBg[0], COLORS.successBg[1], COLORS.successBg[2]);
      doc.setDrawColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
    }
    
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(title, x + 5, yPos + 8);
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    if (highlight) doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.text(value, x + 5, yPos + 18);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(subtext, x + 5, yPos + 25);
  };

  drawCard('1ª Parcela', formatCurrency(result.firstInstallment), 'Parcela Inicial', margin);
  drawCard('Total Pago', formatCurrency(result.totalPaid), `Juros: ${formatCurrency(result.totalInterest)}`, margin + cardWidth + 5);
  
  const incomeStatus = result.isCreditApproved ? 'Compatível' : 'Atenção';
  drawCard('Renda Mínima', formatCurrency(result.requiredMinimumIncome), `Status: ${incomeStatus}`, margin + (cardWidth * 2) + 10, !result.isCreditApproved);

  yPos += 45;

  // --- CHART: BALANCE EVOLUTION (SIMPLIFIED VECTOR) ---
  doc.setFontSize(12);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Evolução do Saldo Devedor', margin, yPos);
  
  yPos += 8;
  const chartHeight = 40;
  const chartWidth = width - (margin * 2);
  const chartBottomY = yPos + chartHeight;
  
  // Axes
  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, chartBottomY, margin + chartWidth, chartBottomY); // X Axis
  doc.line(margin, yPos, margin, chartBottomY); // Y Axis
  
  // Curve
  // Filter points to keep PDF light (approx 50 points max)
  const dataPoints = result.schedule.filter((_, i) => i % Math.ceil(result.schedule.length / 50) === 0 || i === result.schedule.length - 1);
  const maxBalance = result.financedAmount;
  
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(1);
  
  let prevX = margin;
  let prevY = chartBottomY - ((result.schedule[0].balance / maxBalance) * chartHeight);
  
  dataPoints.forEach((point) => {
    const x = margin + ((point.month / result.termMonths) * chartWidth);
    const y = chartBottomY - ((point.balance / maxBalance) * chartHeight);
    
    doc.line(prevX, prevY, x, y);
    
    prevX = x;
    prevY = y;
  });

  // Chart Labels
  doc.setFontSize(8);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(maxBalance), margin + 2, yPos + 5); // Max Y Label
  doc.text('R$ 0,00', margin + chartWidth - 10, chartBottomY - 2); // Min Y Label
  doc.text('Hoje', margin, chartBottomY + 4);
  doc.text(`${data.termYears} Anos`, margin + chartWidth - 10, chartBottomY + 4);

  yPos += chartHeight + 15;

  // --- DETAILED TABLE ---
  doc.setFontSize(12);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Cronograma de Pagamentos (Anual)', margin, yPos);
  
  yPos += 5;

  // Filter rows to show yearly summary + first/last
  const tableRows = result.schedule
    .filter((r, i) => i < 1 || i % 12 === 0 || i >= result.schedule.length - 1)
    .map(r => [
      `${Math.floor(r.month / 12)} anos e ${r.month % 12} m`,
      formatCurrency(r.payment),
      formatCurrency(r.amortization),
      formatCurrency(r.interest),
      formatCurrency(r.balance)
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Período', 'Parcela', 'Amortização', 'Juros', 'Saldo Devedor']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: COLORS.secondary, 
      textColor: 255, 
      fontStyle: 'bold',
      halign: 'center' 
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 3,
      textColor: COLORS.text,
      halign: 'right'
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' } // Period column
    },
    alternateRowStyles: {
      fillColor: COLORS.lightBg
    },
    margin: { top: 10, left: margin, right: margin },
  });

  // --- FOOTER & CONTACT INFO ---
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const footerY = height - 20;

    // Broker Contact Info Area (Only if Corretor)
    if (user.type === 'CORRETOR') {
        doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY - 5, width - margin, footerY - 5);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(user.name, margin, footerY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        
        const contacts = [];
        if (user.phone) contacts.push(user.phone);
        if (user.email) contacts.push(user.email);
        
        doc.text(contacts.join('  •  '), margin, footerY + 10);
    } else {
        // Generic Footer
        doc.setFontSize(9);
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text('www.finansmart.com.br', margin, footerY + 5);
    }

    // Page Number & Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, width - margin, height - 10, { align: 'right' });
    if (user.type === 'CORRETOR') {
         doc.text('Simulação estimada. Consulte condições oficiais.', width - margin, footerY + 5, { align: 'right' });
    }
  }

  doc.save(`FinanSmart_Simulacao_${new Date().getTime()}.pdf`);
};