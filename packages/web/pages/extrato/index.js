import { useEffect, useState } from 'react';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import api from '../../src/lib/api';

const filters = [7, 15, 30];

export default function StatementPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const [statement, setStatement] = useState({ entries: [], page: 1, limit: 10, total: 0, balance: 0 });

  useEffect(() => {
    loadStatement(1, periodDays);
  }, [periodDays]);

  async function loadStatement(page, days) {
    const [{ data }, { data: accountData }] = await Promise.all([
      api.get('/accounts/statement', { params: { page, limit: 10, periodDays: days } }),
      api.get('/accounts/me')
    ]);
    setStatement({ ...data, balance: accountData?.balance ?? data.balance ?? 0 });
  }

  const totalPages = Math.max(1, Math.ceil((statement.total || 0) / statement.limit));

  return (
    <ProtectedPage>
      <Shell title="Extrato" subtitle="Visualize transacoes com filtro por periodo e saldo atualizado.">
        <section className="statement-card">
          <div className="statement-header">
            <div>
              <small>Saldo disponivel</small>
              <div className="statement-balance">
                {Number(statement.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
            <div className="filter-row">
              {filters.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`filter-button${periodDays === days ? ' filter-button--active' : ''}`}
                  onClick={() => setPeriodDays(days)}
                >
                  Ultimos {days} dias
                </button>
              ))}
            </div>
          </div>

          <div className="statement-list">
            {statement.entries.map((entry) => (
              <div className="statement-item" key={entry.id}>
                <div>
                  <strong className="type-title">{entry.type}</strong>
                  <div className="statement-meta">{new Date(entry.date).toLocaleString('pt-BR')}</div>
                  <p className="statement-description">{entry.description || '-'}</p>
                  {entry.favoredName && <div className="statement-meta">Favorecido: {entry.favoredName}</div>}
                  {entry.relatedAccount && entry.relatedAccount !== 'QR ESTATICO' && (
                    <div className="statement-meta">Conta do favorecido: {entry.relatedAccount}</div>
                  )}
                </div>
                <strong className={`statement-value statement-value--${entry.direction}`}>
                  {entry.direction === 'debit' ? '(-) ' : ''}
                  {Number(entry.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>
            ))}
            {statement.entries.length === 0 ? <p className="empty-message">Nenhum item encontrado neste periodo.</p> : null}
          </div>

          <div className="pagination">
            <button className="button-page" type="button" disabled={statement.page <= 1} onClick={() => loadStatement(statement.page - 1, periodDays)}>
              Anterior
            </button>
            <span>Pagina {statement.page} de {totalPages}</span>
            <button className="button-page" type="button" disabled={statement.page >= totalPages} onClick={() => loadStatement(statement.page + 1, periodDays)}>
              Proxima
            </button>
          </div>
        </section>
      </Shell>
    </ProtectedPage>
  );
}
