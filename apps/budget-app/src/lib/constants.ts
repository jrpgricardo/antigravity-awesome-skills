import type { PricingType } from '@/types';

export const PRICING_TYPES: Record<PricingType, string> = {
  hourly: 'Por Hora',
  fixed: 'Preço Fixo',
  monthly_retainer: 'Mensalidade',
  per_sprint: 'Por Sprint',
  custom: 'Personalizado',
};

export const PROPOSAL_STATUSES = {
  draft: { label: 'Rascunho', color: 'gray' },
  sent: { label: 'Enviado', color: 'blue' },
  viewed: { label: 'Visualizado', color: 'yellow' },
  approved: { label: 'Aprovado', color: 'green' },
  rejected: { label: 'Rejeitado', color: 'red' },
  expired: { label: 'Expirado', color: 'gray' },
};

export const SERVICE_CATEGORIES = [
  'Desenvolvimento Web',
  'Desenvolvimento Mobile',
  'Consultoria',
  'Design',
  'DevOps',
  'Suporte e Manutenção',
  'Treinamento',
  'Outros',
];

export const DEFAULT_CURRENCY = 'BRL';

export const DEFAULT_PROPOSAL_VALIDITY_DAYS = 30;
