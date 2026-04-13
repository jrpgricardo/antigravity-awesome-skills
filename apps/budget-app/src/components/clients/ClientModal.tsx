import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { clientSchema } from '@/utils/validators';
import type { Client, ClientFormData } from '@/types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSubmit, client }: ClientModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      cnpj: '',
      notes: '',
    },
  });

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting client:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome da Empresa *"
            {...register('company_name')}
            error={errors.company_name?.message}
          />
          <Input
            label="Nome do Contato *"
            {...register('contact_name')}
            error={errors.contact_name?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="email"
            label="Email *"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Telefone"
            {...register('phone')}
            placeholder="(11) 98765-4321"
            error={errors.phone?.message}
          />
        </div>

        <Input
          label="CNPJ"
          {...register('cnpj')}
          placeholder="00.000.000/0000-00"
          error={errors.cnpj?.message}
        />

        <Textarea
          label="Observações"
          {...register('notes')}
          rows={4}
          placeholder="Informações adicionais sobre o cliente..."
          error={errors.notes?.message}
        />
      </form>
    </Modal>
  );
}
