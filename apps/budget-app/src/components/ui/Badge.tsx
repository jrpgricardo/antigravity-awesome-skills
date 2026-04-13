import { clsx } from 'clsx';

type BadgeVariant =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'archived'
  | 'active'
  | 'paid'
  | 'overdue'
  | 'partial'
  | 'cancelled'
  | 'completed'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-purple-100 text-purple-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-500',
  active: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  partial: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Enviada',
  viewed: 'Visualizada',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  expired: 'Expirada',
  archived: 'Arquivada',
  active: 'Ativo',
  paid: 'Pago',
  overdue: 'Atrasado',
  partial: 'Parcial',
  cancelled: 'Cancelado',
  completed: 'Concluido',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant = (status in variantClasses ? status : 'default') as BadgeVariant;
  const label = statusLabels[status] || status;
  return <Badge variant={variant}>{label}</Badge>;
}
