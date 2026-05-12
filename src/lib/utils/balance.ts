import { PostgrestResponse } from '@supabase/supabase-js';

export interface Transaction {
  amount: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

/**
 * Calculates the total balance for a user.
 * Debits are negative, credits are positive.
 */
export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, transaction) => {
    // Only confirmed transactions or pending credits should count? 
    // Usually, pending credits shouldn't count until confirmed by admin.
    // However, debits (bills) are usually confirmed immediately.
    if (transaction.status === 'confirmed') {
      return acc + Number(transaction.amount);
    }
    return acc;
  }, 0);
}

/**
 * Calculates predicted expenses for the next month.
 * Formula: Fixed Bills + Average Variable Bills + 10% safety margin.
 */
export function calculatePrediction(
  fixedBills: number,
  variableBillsAverage: number,
  safetyMargin: number = 0.1
): number {
  const total = fixedBills + variableBillsAverage;
  return total * (1 + safetyMargin);
}
