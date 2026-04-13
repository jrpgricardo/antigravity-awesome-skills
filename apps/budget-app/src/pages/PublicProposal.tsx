import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function PublicProposal() {
  const { token } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
              <p className="text-gray-600">Token: {token}</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Esta é a visualização pública da proposta.
              </p>
              <p className="text-sm text-gray-500">
                Esta funcionalidade será totalmente implementada na próxima fase.
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="secondary">Baixar PDF</Button>
          <Button>Aprovar Proposta</Button>
        </div>
      </div>
    </div>
  );
}
