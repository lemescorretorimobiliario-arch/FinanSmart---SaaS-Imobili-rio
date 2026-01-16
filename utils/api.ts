import { BankRate } from '../types';

// Dados atualizados conforme fonte BCB (Ref: Nov/2025)
// Modalidade: Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em TR
const BANK_RATES: BankRate[] = [
  { id: '1', bankName: 'Banco Bari', logoColor: 'bg-red-500', logo: 'https://logo.clearbit.com/bancobari.com.br', annualRate: 9.24, monthlyRate: 0.74, updateDate: '2025-11-01' },
  { id: '2', bankName: 'Banco Inter', logoColor: 'bg-orange-500', logo: 'https://logo.clearbit.com/inter.co', annualRate: 10.79, monthlyRate: 0.86, updateDate: '2025-11-01' },
  { id: '3', bankName: 'Banese', logoColor: 'bg-emerald-600', logo: 'https://logo.clearbit.com/banese.com.br', annualRate: 10.93, monthlyRate: 0.87, updateDate: '2025-11-01' },
  { id: '4', bankName: 'Banrisul', logoColor: 'bg-blue-800', logo: 'https://logo.clearbit.com/banrisul.com.br', annualRate: 11.07, monthlyRate: 0.88, updateDate: '2025-11-01' },
  { id: '5', bankName: 'Sicoob', logoColor: 'bg-teal-600', logo: 'https://logo.clearbit.com/sicoob.com.br', annualRate: 11.35, monthlyRate: 0.90, updateDate: '2025-11-01' },
  { id: '6', bankName: 'Caixa', logoColor: 'bg-blue-600', logo: 'https://logo.clearbit.com/caixa.gov.br', annualRate: 11.63, monthlyRate: 0.92, updateDate: '2025-11-01' },
  { id: '7', bankName: 'Sicredi', logoColor: 'bg-green-600', logo: 'https://logo.clearbit.com/sicredi.com.br', annualRate: 11.88, monthlyRate: 0.94, updateDate: '2025-11-01' },
  { id: '8', bankName: 'Itaú', logoColor: 'bg-orange-600', logo: 'https://logo.clearbit.com/itau.com.br', annualRate: 12.52, monthlyRate: 0.99, updateDate: '2025-11-01' },
  { id: '9', bankName: 'Bradesco', logoColor: 'bg-red-600', logo: 'https://logo.clearbit.com/bradesco.com.br', annualRate: 12.73, monthlyRate: 1.00, updateDate: '2025-11-01' },
  { id: '10', bankName: 'Santander', logoColor: 'bg-red-700', logo: 'https://logo.clearbit.com/santander.com.br', annualRate: 13.22, monthlyRate: 1.04, updateDate: '2025-11-01' },
  { id: '11', bankName: 'Banco do Brasil', logoColor: 'bg-yellow-500 text-blue-900', logo: 'https://logo.clearbit.com/bb.com.br', annualRate: 15.34, monthlyRate: 1.20, updateDate: '2025-11-01' },
];

export const getBankRates = (): Promise<BankRate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(BANK_RATES), 500);
  });
};