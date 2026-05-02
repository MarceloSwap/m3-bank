import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';

const shortcuts = [
  { href: '/transferencia', label: 'Transferencias', image: '/icons/shortcut-transfer.svg' },
  { href: '/pagamentos', label: 'Pagamentos', image: '/icons/shortcut-payments.svg' },
  { href: '/deposito', label: 'Deposito', image: '/icons/shortcut-deposit.svg' },
  { href: '/extrato', label: 'Extrato', image: '/icons/shortcut-statement.svg' },
  { href: '/perfil', label: 'Perfil', image: '/icons/shortcut-profile.svg' }
];

export default function HomePage() {
  const { session, refreshAccount } = useAuth();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    async function load() {
      const refreshed = await refreshAccount();
      setRecent(refreshed.statement.entries);
    }

    load().catch(() => undefined);
  }, [refreshAccount]);

  return (
    <ProtectedPage>
      <Shell
        title={`Ola ${session?.user?.name || ''}, bem-vindo!`}
        subtitle="Acompanhe saldo, fluxos financeiros e cenarios de QA em uma interface limpa."
      >
        <section className="balance-card">
          <small>Saldo disponivel atualizado</small>
          <strong>
            {Number(session?.account?.balance || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </strong>
        </section>

        <section className="shortcut-grid">
          {shortcuts.map((item) => (
            <Link className="shortcut-card" href={item.href} key={item.href}>
              <span className="shortcut-card__icon" aria-hidden="true">
                <img src={item.image} alt="" />
              </span>
              <span className="shortcut-card__label">{item.label}</span>
            </Link>
          ))}
        </section>

        <section className="panel">
          <h2 className="panel__title">Movimentacoes recentes</h2>
          {recent.length === 0 ? (
            <p className="empty-text">Nenhuma movimentacao recente encontrada.</p>
          ) : (
            recent.map((entry) => (
              <div className="transaction-row" key={entry.id}>
                <div>
                  <strong className="type-title">{entry.type}</strong>
                  <p>
                    {entry.description || '-'}
                    {entry.relatedAccount && entry.relatedAccount !== 'QR ESTATICO'
                      ? ` - Conta: ${entry.relatedAccount}`
                      : ''}
                  </p>
                </div>
                <span className={`amount amount--${entry.direction}`}>
                  {entry.direction === 'debit' ? '(-) ' : ''}
                  {Number(entry.amount).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
            ))
          )}
        </section>
      </Shell>
    </ProtectedPage>
  );
}
