import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Field from '../../src/components/Field';
import Modal from '../../src/components/Modal';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function TransferPage() {
  const { refreshAccount, session } = useAuth();
  const router = useRouter();
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
  const [isPopoverMounted, setIsPopoverMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const { data } = await api.get('/accounts');
        setAccounts(data.accounts.filter((account) =>
          account.number !== session?.account?.number || account.digit !== session?.account?.digit
        ));
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
      }
    }

    if (session) {
      loadAccounts();
    }
  }, [session]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (showAccountList && popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowAccountList(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showAccountList]);

  useEffect(() => {
    if (showAccountList) {
      setIsPopoverMounted(true);
      return undefined;
    }

    const timeoutId = setTimeout(() => setIsPopoverMounted(false), 180);
    return () => clearTimeout(timeoutId);
  }, [showAccountList]);

  function selectAccount(account) {
    setForm({
      ...form,
      accountNumber: account.number.toString(),
      accountDigit: account.digit.toString()
    });
    setShowAccountList(false);
    setSearchTerm('');
  }

  const filteredAccounts = accounts.filter((account) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (account.ownerName?.toLowerCase() || '').includes(term) ||
      `${account.number}-${account.digit}`.toLowerCase().includes(term);
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!/^\d+$/.test(form.accountNumber)) nextErrors.accountNumber = 'Conta invalida ou inexistente';
    if (!/^\d+$/.test(form.accountDigit)) nextErrors.accountDigit = 'Conta invalida ou inexistente';
    if (!form.description) nextErrors.description = 'Descricao e obrigatoria';
    if (!form.amount || Number(form.amount) < 10) nextErrors.amount = 'Valor minimo para transferencia e de R$ 10,00';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const { data } = await api.post('/transfers', { ...form, amount: Number(form.amount) });
      await refreshAccount();
      setForm({ accountNumber: '', accountDigit: '', amount: '', description: '', authorizationToken: '' });
      setModal({
        type: 'success',
        title: 'Transferencia',
        message: `${data.message}. Deseja fazer outra operacao ou voltar para a Home?`,
        actions: [
          { label: 'Fazer outra transferencia', onClick: () => setModal(null), variant: 'primary' },
          { label: 'Voltar para Home', onClick: () => router.push('/home'), variant: 'secondary' }
        ]
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha na transferencia',
        message: error.response?.data?.message || 'Nao foi possivel concluir a transferencia'
      });
    }
  }

  return (
    <ProtectedPage>
      <Shell
        title="Transferencias"
        subtitle="Selecione uma conta da lista ou digite manualmente os dados para transferir."
        headerAction={(
          <div className="popover" ref={popoverRef}>
            <button className="button-toggle" type="button" onClick={() => setShowAccountList(!showAccountList)}>
              {showAccountList ? 'Ocultar' : 'Mostrar'} contas disponiveis ({accounts.length})
            </button>
            {isPopoverMounted ? (
              <div className={`popover__panel${showAccountList ? '' : ' popover__panel--closing'}`}>
                <input className="popover__search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por titular ou conta" />
                <div className="account-list">
                  {filteredAccounts.length === 0 ? (
                    <p className="empty-message">Nenhuma conta disponivel para transferencia.</p>
                  ) : (
                    filteredAccounts.map((account) => (
                      <button className="account-item" key={`${account.number}-${account.digit}`} type="button" onClick={() => selectAccount(account)}>
                        <span className="account-info">
                          <strong>{account.ownerName}</strong>
                          <small>Conta: {account.number}-{account.digit}</small>
                        </span>
                        <span className="select-pill">Selecionar</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      >
        <form className="form-card" onSubmit={handleSubmit}>
          <Field label="Numero da conta" value={form.accountNumber} inputMode="numeric" onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} error={errors.accountNumber} />
          <Field label="Digito" value={form.accountDigit} inputMode="numeric" onChange={(event) => setForm({ ...form, accountDigit: event.target.value })} error={errors.accountDigit} />
          <Field label="Valor" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} error={errors.amount} />
          <Field label="Descricao" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} error={errors.description} />
          <Field label="Token de autorizacao" value={form.authorizationToken} onChange={(event) => setForm({ ...form, authorizationToken: event.target.value })} placeholder="Obrigatorio acima de R$ 5.000,00" />
          <button className="button-primary" type="submit">Transferir agora</button>
        </form>

        {modal ? <Modal type={modal.type} title={modal.title} message={modal.message} actions={modal.actions} onClose={() => setModal(null)} /> : null}
      </Shell>
    </ProtectedPage>
  );
}
