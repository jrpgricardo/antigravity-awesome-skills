import type { PricingType } from '@/types';

/**
 * Get the unit label for a pricing type
 */
export function getUnitLabel(pricingType: PricingType): string {
  const labels: Record<PricingType, string> = {
    hourly: 'hora',
    fixed: 'unidade',
    monthly_retainer: 'mes',
    per_sprint: 'sprint',
    custom: 'unidade',
  };
  return labels[pricingType];
}

/**
 * Get human-readable pricing type name
 */
export function getPricingTypeName(pricingType: PricingType): string {
  const names: Record<PricingType, string> = {
    hourly: 'Por Hora',
    fixed: 'Preco Fixo',
    monthly_retainer: 'Retainer Mensal',
    per_sprint: 'Por Sprint',
    custom: 'Personalizado',
  };
  return names[pricingType];
}

/**
 * Calculate days until a date
 */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if a proposal is expired
 */
export function isExpired(validUntil: string | null): boolean {
  if (!validUntil) return false;
  return daysUntil(validUntil) < 0;
}

/**
 * Generate a random token for public links
 */
export function generateToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate conversion rate
 */
export function conversionRate(approved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((approved / total) * 10000) / 100;
}

/**
 * Calculate average from array of numbers
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Format CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Format phone number (Brazilian)
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}
