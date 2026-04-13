/**
 * Currency formatting utilities for BRL
 */

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const PERCENT_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return BRL_FORMATTER.format(value);
}

export function formatCurrencyCompact(value: number): string {
  return COMPACT_FORMATTER.format(value);
}

export function formatPercent(value: number): string {
  return PERCENT_FORMATTER.format(value / 100);
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export function calculateItemTotal(
  unitPrice: number,
  quantity: number,
  discount: number
): number {
  const subtotal = unitPrice * quantity;
  const discountAmount = subtotal * (discount / 100);
  return Math.round((subtotal - discountAmount) * 100) / 100;
}

export function calculateProposalTotals(
  items: { total: number }[],
  discountPercentage: number,
  discountValue: number
): { totalValue: number; finalValue: number } {
  const totalValue = items.reduce((sum, item) => sum + item.total, 0);
  const percentDiscount = totalValue * (discountPercentage / 100);
  const finalValue = Math.max(0, totalValue - percentDiscount - discountValue);
  return {
    totalValue: Math.round(totalValue * 100) / 100,
    finalValue: Math.round(finalValue * 100) / 100,
  };
}
