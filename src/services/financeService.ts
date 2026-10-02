import { mockFinanceSummary, mockTransactions } from '../mock/finance';
import type { FinanceSummary, Transaction } from '../types/finance';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const financeService = {
  async getSummary(): Promise<FinanceSummary> {
    await delay(300);
    return { ...mockFinanceSummary };
  },

  async getTransactions(): Promise<Transaction[]> {
    await delay(250);
    return mockTransactions.map((t) => ({ ...t }));
  },
};