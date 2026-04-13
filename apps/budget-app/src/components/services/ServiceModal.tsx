import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { serviceSchema } from '@/utils/validators';
import { SERVICE_CATEGORIES, PRICING_TYPES } from '@/lib/constants';
import type { ServiceCatalog, ServiceFormData } from '@/types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  service?: ServiceCatalog | null;
}

export function ServiceModal({ isOpen, onClose, onSubmit, service }: ServiceModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || {
      name: '',
      category: SERVICE_CATEGORIES[0],
      pricing_type: 'fixed',
      default_price: 0,
      description: '',
      active: true,
    },
  });

  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting service:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pricingTypeOptions = Object.entries(PRICING_TYPES).map(([value, label]) => ({
    value,
    label,
  }));

  const categoryOptions = SERVICE_CATEGORIES.map((cat) => ({ value: cat, label: cat }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={service ? 'Editar Serviço' : 'Novo Serviço'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input
          label="Nome do Serviço *"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Ex: Desenvolvimento de Website"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoria *"
            {...register('category')}
            options={categoryOptions}
            error={errors.category?.message}
          />
          <Select
            label="Tipo de Precificação *"
            {...register('pricing_type')}
            options={pricingTypeOptions}
            error={errors.pricing_type?.message}
          />
        </div>

        <Input
          type="number"
          label="Preço Padrão (R$) *"
          {...register('default_price', { valueAsNumber: true })}
          error={errors.default_price?.message}
          step="0.01"
          min="0"
        />

        <Textarea
          label="Descrição *"
          {...register('description')}
          rows={4}
          placeholder="Descreva o serviço oferecido..."
          error={errors.description?.message}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('active')}
            id="active"
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Serviço Ativo
          </label>
        </div>
      </form>
    </Modal>
  );
}
