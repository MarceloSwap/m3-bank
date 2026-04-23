import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Field from '../../src/components/Field';
import Modal from '../../src/components/Modal';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function TransferPage() {
  const { refreshAccount, session } = useAuth();
  const [form, setForm] = useState({
    accountNumber: '',
    accountDigit: '',
    amount: '',
    description: '',
    authorizationToken: ''
  });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showAccountList, setShowAccountList] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const { data } = await api.get('/accounts');
        // Filtrar a própria conta do usuário
        const filteredAccounts = data.accounts.filter(account =>
          account.number !== session?.account?.number ||
          account.digit !== session?.account?.digit
        );
        setAccounts(filteredAccounts);
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
      }
    }

    if (session) {
      loadAccounts();
    }
  }, [session]);

  function selectAccount(account) {
    setForm({
      ...form,
      accountNumber: account.number.toString(),
      accountDigit: account.digit.toString()
    });
    setShowAccountList(false);
  }

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

    if (!form.amount || Number(form.amount) < 10) {
      nextErrors.amount = 'Valor mínimo para transferência é de R$ 10,00';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const { data } = await api.post('/transfers', {
        ...form,
        amount: Number(form.amount)
      });

      await refreshAccount();
      setForm({
        accountNumber: '',
        accountDigit: '',
        amount: '',
        description: '',
        authorizationToken: ''
      });
      setModal({
        type: 'success',
        title: 'Transferência',
        message: data.message
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha na transferência',
        message: error.response?.data?.message || 'Não foi possível concluir a transferência'
      });
    }
  }

  return (
    <ProtectedPage>
      <Shell
        title="Transferências"
        subtitle="Selecione uma conta da lista ou digite manualmente os dados para transferir."
      >
        <AccountListSection>
          <ListToggleButton
            type="button"
            onClick={() => setShowAccountList(!showAccountList)}
          >
            {showAccountList ? 'Ocultar' : 'Mostrar'} contas disponíveis ({accounts.length})
          </ListToggleButton>

          {showAccountList && (
            <AccountList>
              {accounts.length === 0 ? (
                <EmptyMessage>Nenhuma conta disponível para transferência.</EmptyMessage>
              ) : (
                accounts.map((account) => (
                  <AccountItem
                    key={`${account.number}-${account.digit}`}
                    onClick={() => selectAccount(account)}
                  >
                    <AccountInfo>
                      <strong>{account.ownerName}</strong>
                      <small>Conta: {account.number}-{account.digit}</small>
                    </AccountInfo>
                    <SelectButton>Selecionar</SelectButton>
                  </AccountItem>
                ))
              )}
            </AccountList>
          )}
        </AccountListSection>

        <FormCard onSubmit={handleSubmit}>
          <Field
            label="Número da conta"
            value={form.accountNumber}
            inputMode="numeric"
            onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
            error={errors.accountNumber}
          />
          <Field
            label="Dígito"
            value={form.accountDigit}
            inputMode="numeric"
            onChange={(event) => setForm({ ...form, accountDigit: event.target.value })}
            error={errors.accountDigit}
          />
          <Field
            label="Valor"
            type="number"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            error={errors.amount}
          />
          <Field
            label="Descrição"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            error={errors.description}
          />
          <Field
            label="Token de autorização"
            value={form.authorizationToken}
            onChange={(event) => setForm({ ...form, authorizationToken: event.target.value })}
            placeholder="Obrigatório acima de R$ 5.000,00"
          />
          <SubmitButton type="submit">Transferir agora</SubmitButton>
        </FormCard>

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

const FormCard = styled.form`
  display: grid;
  gap: 18px;
  max-width: 560px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const SubmitButton = styled.button`
  border: 0;
  border-radius: 16px;
  padding: 14px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  font-weight: 700;
`;

const AccountListSection = styled.section`
  margin-bottom: 24px;
`;

const ListToggleButton = styled.button`
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: ${({ theme }) => theme.colors.light};
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AccountList = styled.div`
  display: grid;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const AccountItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }
`;

const AccountInfo = styled.div`
  strong {
    display: block;
    color: ${({ theme }) => theme.colors.light};
    margin-bottom: 4px;
  }

  small {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const SelectButton = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.ink};
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    transform: translateY(-1px);
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 20px;
`;
