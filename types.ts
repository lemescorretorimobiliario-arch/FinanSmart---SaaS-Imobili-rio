export type AmortizationSystem = 'SAC' | 'PRICE';

export interface SimulationData {
  propertyValue: number;
  downPayment: number;
  interestRateAnnual: number; // Percentage
  termYears: number;
  amortizationSystem: AmortizationSystem;
  monthlyIncome: number;
  maxIncomeCommitment: number; // Percentage (default 30)

  // Smart Amortization Settings
  extraAmortizationMonthly?: number;
  extraAmortizationStrategy?: 'REDUCE_TERM' | 'REDUCE_INSTALLMENT';
}

export interface InstallmentRow {
  month: number;
  payment: number;
  interest: number;
  amortization: number;
  balance: number;
  extraPayment?: number;
}

export interface CalculationResult {
  financedAmount: number;
  termMonths: number;

  // Initial Snapshot
  firstInstallment: number;
  lastInstallment: number;
  averageInstallment: number;

  // Totals
  totalPaid: number;
  totalInterest: number;
  totalAmortization: number;

  // Analysis
  incomeCommitmentPercent: number;
  requiredMinimumIncome: number;
  isCreditApproved: boolean;

  // Detailed Schedule
  schedule: InstallmentRow[];

  // Comparison (if smart amortization is active)
  comparison?: {
    isActive: boolean;
    originalTermMonths: number;
    originalTotalInterest: number;
    originalTotalPaid: number;
    savedInterest: number;
    savedMonths: number;
  };
}

export interface BankRate {
  id: string;
  bankName: string;
  logoColor: string;
  annualRate: number;
  monthlyRate: number;
  updateDate: string;
}

export type UserPlan = 'FREE' | 'PRO';
export const MAX_FREE_SIMULATIONS = 5;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added for PDF contact info
  avatarUrl?: string; // Public URL from Supabase Storage
  coverUrl?: string; // Public URL from Supabase Storage
  plan: UserPlan;
  type: 'CORRETOR' | 'CLIENTE';
  simulationsCount: number;
  setupCompleted: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

export type LeadStatus = 'NOVO' | 'EM_ATENDIMENTO' | 'VISITA' | 'PROPOSTA' | 'FECHADO' | 'PERDIDO';

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  status: LeadStatus;
  interest: string; // Valor do imóvel simulado
  simulationData?: SimulationData; // Dados completos da simulação
}

export interface SavedSimulation {
  id: string;
  date: string;
  propertyValue: number;
  downPayment: number;
  termYears: number;
  monthlyPayment: number;
  interestRate: number;
  amortizationSystem: AmortizationSystem;
  monthlyIncome: number;
}