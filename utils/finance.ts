import { CalculationResult, SimulationData, InstallmentRow } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  return Number(value.replace(/\D/g, '')) / 100;
};

// Helper to estimate minimum income required based on current partial inputs
// Uses SAC logic as it generates the highest first installment (safest for approval)
export const calculateEstimatedMinimumIncome = (
  propertyValue: number, 
  downPayment: number, 
  termYears: number, 
  annualRate: number
): number => {
  const financedAmount = propertyValue - downPayment;
  if (financedAmount <= 0) return 0;
  
  const totalMonths = termYears * 12;
  const monthlyRate = Math.pow(1 + (annualRate / 100), 1 / 12) - 1;
  
  const amortization = financedAmount / totalMonths;
  const interest = financedAmount * monthlyRate;
  const firstInstallment = amortization + interest;
  
  // Standard rule: Installment cannot exceed 30% of income
  return firstInstallment / 0.30;
};

// Internal function to run a single pass calculation
const runCalculationPass = (data: SimulationData, useExtraAmortization: boolean) => {
  const financedAmount = data.propertyValue - data.downPayment;
  const monthlyRate = Math.pow(1 + (data.interestRateAnnual / 100), 1 / 12) - 1;
  const totalMonths = data.termYears * 12;
  
  let schedule: InstallmentRow[] = [];
  let currentBalance = financedAmount;
  let totalPaid = 0;
  let totalInterest = 0;
  let totalAmortization = 0;
  
  const extraPayment = useExtraAmortization ? (data.extraAmortizationMonthly || 0) : 0;
  const strategy = data.extraAmortizationStrategy || 'REDUCE_TERM';
  
  let sacAmortization = financedAmount / totalMonths;
  let pricePmt = financedAmount * (
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  for (let month = 1; month <= totalMonths; month++) {
    if (currentBalance <= 0.01) break;

    let interest = currentBalance * monthlyRate;
    let amortization = 0;
    let payment = 0;

    if (data.amortizationSystem === 'SAC') {
      amortization = sacAmortization;
      payment = amortization + interest;
    } else {
      payment = pricePmt;
      amortization = payment - interest;
    }

    if (currentBalance < amortization) {
      amortization = currentBalance;
      payment = amortization + interest;
    }

    // Smart Amortization
    let appliedExtra = 0;
    if (extraPayment > 0) {
      appliedExtra = extraPayment;
      const remainingAfterRegular = currentBalance - amortization;
      if (remainingAfterRegular < appliedExtra) {
        appliedExtra = remainingAfterRegular;
      }
      if (appliedExtra > 0) {
        amortization += appliedExtra;
        payment += appliedExtra;
      }
    }

    currentBalance -= amortization;
    if (currentBalance < 0.01) currentBalance = 0;

    totalPaid += payment;
    totalInterest += interest;
    totalAmortization += amortization;

    schedule.push({
      month,
      payment,
      interest,
      amortization,
      balance: currentBalance,
      extraPayment: appliedExtra
    });

    // Strategy Logic (Only if extra payment is active in this pass)
    if (useExtraAmortization && currentBalance > 0 && strategy === 'REDUCE_INSTALLMENT') {
       const remainingMonths = totalMonths - month;
       if (remainingMonths > 0) {
           if (data.amortizationSystem === 'SAC') {
               sacAmortization = currentBalance / remainingMonths;
           } else {
               pricePmt = currentBalance * (
                   (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
                   (Math.pow(1 + monthlyRate, remainingMonths) - 1)
               );
           }
       }
    }
  }

  return {
    financedAmount,
    schedule,
    totalPaid,
    totalInterest,
    totalAmortization,
    firstInstallment: schedule[0]?.payment || 0,
    lastInstallment: schedule[schedule.length - 1]?.payment || 0
  };
};

export const calculateSimulation = (data: SimulationData): CalculationResult => {
  // 1. Run actual simulation (with extra amortization if set)
  const actual = runCalculationPass(data, true);
  
  // 2. Run baseline simulation (without extra amortization) for comparison
  const baseline = runCalculationPass(data, false);

  // Analysis
  const incomeCommitmentPercent = (actual.firstInstallment / data.monthlyIncome) * 100;
  const isCreditApproved = incomeCommitmentPercent <= data.maxIncomeCommitment;
  const requiredMinimumIncome = actual.firstInstallment / (data.maxIncomeCommitment / 100);

  // Compare
  const hasExtra = (data.extraAmortizationMonthly || 0) > 0;
  const comparison = {
    isActive: hasExtra,
    originalTermMonths: baseline.schedule.length,
    originalTotalInterest: baseline.totalInterest,
    originalTotalPaid: baseline.totalPaid,
    savedInterest: baseline.totalInterest - actual.totalInterest,
    savedMonths: baseline.schedule.length - actual.schedule.length
  };

  return {
    financedAmount: actual.financedAmount,
    termMonths: actual.schedule.length,
    firstInstallment: actual.firstInstallment,
    lastInstallment: actual.lastInstallment,
    averageInstallment: actual.totalPaid / actual.schedule.length,
    totalPaid: actual.totalPaid,
    totalInterest: actual.totalInterest,
    totalAmortization: actual.totalAmortization,
    schedule: actual.schedule,
    incomeCommitmentPercent,
    requiredMinimumIncome,
    isCreditApproved,
    comparison
  };
};