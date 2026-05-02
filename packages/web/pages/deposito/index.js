import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Field from '../../src/components/Field';
import Modal from '../../src/components/Modal';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function DepositPage() {
  const { refreshAccount, session } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ accountNumber: '', accountDigit: '', amount: '', description: '' });
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
        setAccounts(data.accounts);
      } catch (error) {
        console.error('Erro ao carregar contas para deposito:', error);
      }
    }

    if (session) loadAccounts();
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
    setForm((previous) => ({ ...previous, accountNumber: account.number.toString(), accountDigit: account.digit.toString() }));
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
    if (!form.amount || Number(form.amount) < 10) nextErrors.amount = 'Valor minimo para deposito e R$ 10,00';
    if (Number(form.amount) > 10000) nextErrors.amount = 'Valor maximo para deposito e R$ 10.000,00';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const { data } = await api.post('/deposits', { ...form, amount: Number(form.amount) });
      await refreshAccount();
      setForm({ accountNumber: '', accountDigit: '', amount: '', description: '' });
      setModal({
        type: 'success',
        title: 'Deposito',
        message: `${data.message}. Deseja fazer outro deposito ou voltar para a Home?`,
        actions: [
          { label: 'Fazer outro deposito', onClick: () => setModal(null), variant: 'primary' },
          { label: 'Voltar para Home', onClick: () => router.push('/home'), variant: 'secondary' }
        ]
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha no deposito',
        message: error.response?.data?.message || 'Nao foi possivel concluir o deposito'
      });
    }
  }

  return (
    <ProtectedPage>
      <Shell
        title="Deposito"
        subtitle="Realize depositos em contas bancarias com validacao de limites e saldo."
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
                    <p className="empty-message">Nenhuma conta disponivel para deposito.</p>
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
          <div className="account-grid">
            <Field label="Numero da conta" value={form.accountNumber} inputMode="numeric" placeholder="Ex: 12345" onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} error={errors.accountNumber} />
            <Field label="Digito" value={form.accountDigit} inputMode="numeric" placeholder="Ex: 6" onChange={(event) => setForm({ ...form, accountDigit: event.target.value })} error={errors.accountDigit} />
          </div>
          <Field label="Valor (R$)" type="number" placeholder="Minimo R$ 10,00" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} error={errors.amount} />
          <Field label="Descricao" placeholder="Motivo do deposito" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} error={errors.description} />
          <button className="button-primary" type="submit">Confirmar Deposito</button>
        </form>

        {modal ? <Modal type={modal.type} title={modal.title} message={modal.message} actions={modal.actions} onClose={() => setModal(null)} /> : null}
      </Shell>
    </ProtectedPage>
  );
}
