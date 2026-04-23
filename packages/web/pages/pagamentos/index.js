import { useState } from 'react';
import styled from 'styled-components';
import Field from '../../src/components/Field';
import Modal from '../../src/components/Modal';
import ProtectedPage from '../../src/components/ProtectedPage';
import QrMock from '../../src/components/QrMock';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function PaymentsPage() {
  const { refreshAccount } = useAuth();
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
        message: data.message
      });
      setAmount('');
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha no pagamento',
        message: error.response?.data?.message || 'Não foi possível simular a leitura'
      });
    }
  }

  return (
    <ProtectedPage>
      <Shell
        title="Pagamentos com Pix simulado"
        subtitle="A tela agora conversa com a nova paleta e mantém a navegação principal sempre visível."
      >
        <Grid>
          <Card>
            <QrMock />
            <Caption>QR Code estático para cenários E2E</Caption>
          </Card>

          <Card>
            <Field
              label="Valor do pagamento"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Field
              label="Descrição"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <ActionButton type="button" onClick={handleSimulate}>
              Simular Leitura
            </ActionButton>
          </Card>
        </Grid>

        {modal ? (
          <Modal
            type={modal.type}
            title={modal.title}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Shell>
    </ProtectedPage>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  display: grid;
  justify-items: center;
  gap: 18px;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const Caption = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
`;

const ActionButton = styled.button`
  border: 0;
  border-radius: 16px;
  padding: 14px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  font-weight: 700;
  width: 100%;
`;
