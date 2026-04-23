import { useState } from 'react';
import styled from 'styled-components';
import Field from '../../src/components/Field';
import Modal from '../../src/components/Modal';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function DepositPage() {
  const { refreshAccount } = useAuth();
  const [form, setForm] = useState({
    accountNumber: '',
    accountDigit: '',
    amount: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!/^\d+$/.test(form.accountNumber)) {
      nextErrors.accountNumber = 'Conta inválida ou inexistente';
    }

    if (!/^\d+$/.test(form.accountDigit)) {
      nextErrors.accountDigit = 'Conta inválida ou inexistente';
    }

    if (!form.description) {
      nextErrors.description = 'Descrição é obrigatória';
    }

    if (!form.amount || Number(form.amount) < 1) {
      nextErrors.amount = 'Valor mínimo para depósito é R$ 1,00';
    }

    if (Number(form.amount) > 10000) {
      nextErrors.amount = 'Valor máximo para depósito é R$ 10.000,00';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const { data } = await api.post('/deposits', {
        ...form,
        amount: Number(form.amount)
      });

      await refreshAccount();
      setForm({
        accountNumber: '',
        accountDigit: '',
        amount: '',
        description: ''
      });
      setModal({
        type: 'success',
        title: 'Depósito',
        message: data.message
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha no depósito',
        message: error.response?.data?.message || 'Não foi possível concluir o depósito'
      });
    }
  }

  return (
    <ProtectedPage>
      <Shell
        title="Depósito"
        subtitle="Realize depósitos em contas bancárias com validação de limites e atualização automática do saldo."
      >
        <FormCard onSubmit={handleSubmit}>
          
          {/* Agrupando Conta e Dígito lado a lado */}
          <AccountGrid>
            <Field
              label="Número da conta"
              value={form.accountNumber}
              inputMode="numeric"
              placeholder="Ex: 12345"
              onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
              error={errors.accountNumber}
            />
            <Field
              label="Dígito"
              value={form.accountDigit}
              inputMode="numeric"
              placeholder="Ex: 6"
              onChange={(event) => setForm({ ...form, accountDigit: event.target.value })}
              error={errors.accountDigit}
            />
          </AccountGrid>

          <Field
            label="Valor (R$)"
            type="number"
            placeholder="Mínimo R$ 1,00"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            error={errors.amount}
          />
          <Field
            label="Descrição"
            placeholder="Motivo do depósito"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            error={errors.description}
          />
          
          <SubmitButton type="submit">Confirmar Depósito</SubmitButton>
        </FormCard>

        {modal && (
          <Modal
            type={modal.type}
            title={modal.title}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        )}
      </Shell>
    </ProtectedPage>
  );
}

const FormCard = styled.form`
  padding: 32px;
  border-radius: ${({ theme }) => theme.radius.lg};
  /* Cores e efeitos do novo tema premium */
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.default};
  backdrop-filter: blur(12px);
  
  display: grid;
  gap: 20px;
  max-width: 480px;
`;

const AccountGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 16px 24px;
  border-radius: 999px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #0b1325; /* Texto super escuro para dar contraste no amarelo */
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.1); /* Dá um brilho extra ao passar o mouse */
  }
`;