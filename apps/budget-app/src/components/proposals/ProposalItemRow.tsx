import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/utils/currency';
import { calculateItemTotal } from '@/utils/calculations';
import { PRICING_TYPES } from '@/lib/constants';
import type { ProposalItemFormData, PricingType } from '@/types';

interface ProposalItemRowProps {
  item: ProposalItemFormData;
  index: number;
  onChange: (index: number, field: keyof ProposalItemFormData, value: any) => void;
  onRemove: (index: number) => void;
}

export function ProposalItemRow({ item, index, onChange, onRemove }: ProposalItemRowProps) {
  const pricingTypeOptions = Object.entries(PRICING_TYPES).map(([value, label]) => ({
    value,
    label,
  }));

  const total = calculateItemTotal(item.unit_price, item.quantity, item.discount);

  return (
    <tr className="border-b border-gray-200">
      <td className="py-3 px-2">
        <Input
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          placeholder="Descrição do item"
          className="min-w-[200px]"
        />
      </td>
      <td className="py-3 px-2">
        <Select
          value={item.pricing_type}
          onChange={(e) => onChange(index, 'pricing_type', e.target.value as PricingType)}
          options={pricingTypeOptions}
          className="min-w-[140px]"
        />
      </td>
      <td className="py-3 px-2">
        <Input
          type="number"
          value={item.unit_price}
          onChange={(e) => onChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
          step="0.01"
          min="0"
          className="min-w-[120px]"
        />
      </td>
      <td className="py-3 px-2">
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
          step="0.01"
          min="0"
          className="min-w-[100px]"
        />
      </td>
      <td className="py-3 px-2">
        <Input
          type="number"
          value={item.discount}
          onChange={(e) => onChange(index, 'discount', parseFloat(e.target.value) || 0)}
          step="0.01"
          min="0"
          max="100"
          className="min-w-[100px]"
        />
      </td>
      <td className="py-3 px-2 text-right font-semibold">
        {formatCurrency(total)}
      </td>
      <td className="py-3 px-2">
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800 p-1"
          type="button"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}
