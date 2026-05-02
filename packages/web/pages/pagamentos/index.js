import { useState } from 'react';
import { useRouter } from 'next/router';
import Field from '../../src/components/Field';
import Modal from '../../src/components/Modal';
import ProtectedPage from '../../src/components/ProtectedPage';
import QrMock from '../../src/components/QrMock';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function PaymentsPage() {
  const { refreshAccount } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Pix simulado de teste');
  const [modal, setModal] = useState(null);

  async function handleSimulate() {
    try {
      const { data } = await api.post('/payments/pix/simulate', {
        amount: Number(amount),
        description
      });
      await refreshAccount();
      setModal({
        type: 'success',
        title: 'Pagamento',
        message: `${data.message}. Deseja fazer outro pagamento ou voltar para a Home?`,
        actions: [
          { label: 'Fazer outro pagamento', onClick: () => setModal(null), variant: 'primary' },
          { label: 'Voltar para Home', onClick: () => router.push('/home'), variant: 'secondary' }
        ]
      });
      setAmount('');
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha no pagamento',
        message: error.response?.data?.message || 'Nao foi possivel simular a leitura'
      });
    }
  }

  return (
    <ProtectedPage>
      <Shell
        title="Pagamentos com Pix simulado"
        subtitle="Simule a leitura de QR Code estatico e valide debito em saldo e extrato."
      >
        <div className="payment-grid">
          <section className="payment-card">
            <QrMock />
            <p className="payment-caption">QR Code estatico para cenarios E2E</p>
          </section>

          <section className="payment-card">
            <Field label="Valor do pagamento" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <Field label="Descricao" value={description} onChange={(event) => setDescription(event.target.value)} />
            <button className="button-primary" type="button" onClick={handleSimulate}>
              Simular Leitura
            </button>
          </section>
        </div>

        {modal ? (
          <Modal type={modal.type} title={modal.title} message={modal.message} actions={modal.actions} onClose={() => setModal(null)} />
        ) : null}
      </Shell>
    </ProtectedPage>
  );
}
