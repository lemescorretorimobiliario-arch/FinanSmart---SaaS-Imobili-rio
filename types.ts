import { UserRole, UserPlan } from './core/system';
export { UserRole, UserPlan };

export type AmortizationSystem = 'SAC' | 'PRICE';

export interface SimulationData {
  propertyValue: number;
  downPayment: number;
  interestRateAnnual: number;
  termYears: number;
  amortizationSystem: AmortizationSystem;
  monthlyIncome: number;
  maxIncomeCommitment: number;
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
  firstInstallment: number;
  lastInstallment: number;
  averageInstallment: number;
  totalPaid: number;
  totalInterest: number;
  totalAmortization: number;
  incomeCommitmentPercent: number;
  requiredMinimumIncome: number;
  isCreditApproved: boolean;
  schedule: InstallmentRow[];
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  plan: UserPlan;
  type: UserRole;
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
  interest: string;
  simulationData?: SimulationData;
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