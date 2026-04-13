import type { ProposalItem, ProposalItemFormData } from '@/types';

/**
 * Calculate the total for a proposal item
 */
export function calculateItemTotal(
  unitPrice: number,
  quantity: number,
  discount: number = 0
): number {
  const subtotal = unitPrice * quantity;
  const discountAmount = (subtotal * discount) / 100;
  return subtotal - discountAmount;
}

/**
 * Calculate the total for all proposal items
 */
export function calculateProposalTotal(items: (ProposalItem | ProposalItemFormData)[]): number {
  return items.reduce((total, item) => {
    const itemTotal = calculateItemTotal(item.unit_price, item.quantity, item.discount);
    return total + itemTotal;
  }, 0);
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(subtotal: number, discountPercent: number): number {
  return (subtotal * discountPercent) / 100;
}

/**
 * Generate a unique public token for proposals
 */
export function generatePublicToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
