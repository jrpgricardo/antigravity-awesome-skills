import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ProposalBuilder() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nova Proposta</h1>
        <p className="text-gray-600">Crie uma nova proposta comercial para seu cliente</p>
      </div>

      <div className="max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Informações Básicas</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input label="Título da Proposta" placeholder="Ex: Desenvolvimento de Site" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cliente" placeholder="Selecione um cliente" />
                <Input type="date" label="Válido até" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Itens da Proposta</h2>
              <Button size="sm">Adicionar Item</Button>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 text-center py-8">
              Nenhum item adicionado. Clique em "Adicionar Item" para começar.
            </p>
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Detalhes Adicionais</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Introdução
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Texto introdutório da proposta..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termos e Condições
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Termos e condições..."
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-4">
          <Button variant="secondary">Salvar Rascunho</Button>
          <Button>Enviar Proposta</Button>
        </div>
      </div>
    </div>
  );
}
