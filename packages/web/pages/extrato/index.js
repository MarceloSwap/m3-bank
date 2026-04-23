import { useEffect, useState } from 'react';
import styled from 'styled-components';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import api from '../../src/lib/api';

const filters = [7, 15, 30];

export default function StatementPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const [statement, setStatement] = useState({
    entries: [],
    page: 1,
    limit: 10,
    total: 0,
    balance: 0
  });

  useEffect(() => {
    loadStatement(1, periodDays);
  }, [periodDays]);

  async function loadStatement(page, days) {
    const { data } = await api.get('/accounts/statement', {
      params: {
        page,
        limit: 10,
        periodDays: days
      }
    });

    setStatement(data);
  }

  const totalPages = Math.max(1, Math.ceil((statement.total || 0) / statement.limit));

  return (
    <ProtectedPage>
      <Shell
        title="Extrato"
        subtitle="Visualize suas transações com filtro por período e saldo atualizado em tempo real."
      >
        <StatementCard>
          <HeaderRow>
            <div>
              <small>Saldo disponível</small>
              <BalanceValue>
                {Number(statement.balance || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </BalanceValue>
            </div>
            <FilterRow>
              {filters.map((days) => (
                <FilterButton
                  key={days}
                  type="button"
                  $active={periodDays === days}
                  onClick={() => setPeriodDays(days)}
                >
                  Últimos {days} dias
                </FilterButton>
              ))}
            </FilterRow>
          </HeaderRow>

          <List>
            {statement.entries.map((entry) => (
              <Item key={entry.id}>
                <div>
                  <TypeTitle>{entry.type}</TypeTitle>
                  <Meta>{new Date(entry.date).toLocaleString('pt-BR')}</Meta>
                  <Description>{entry.description || '-'}</Description>
                </div>
                <Value $direction={entry.direction}>
                  {entry.direction === 'debit' ? '(-) ' : ''}
                  {Number(entry.amount).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Value>
              </Item>
            ))}
            {statement.entries.length === 0 ? (
              <EmptyMessage>Nenhum item encontrado neste período.</EmptyMessage>
            ) : null}
          </List>

          <Pagination>
            <PageButton
              type="button"
              disabled={statement.page <= 1}
              onClick={() => loadStatement(statement.page - 1, periodDays)}
            >
              ← Anterior
            </PageButton>
            <span>
              Página {statement.page} de {totalPages}
            </span>
            <PageButton
              type="button"
              disabled={statement.page >= totalPages}
              onClick={() => loadStatement(statement.page + 1, periodDays)}
            >
              Próxima →
            </PageButton>
          </Pagination>
        </StatementCard>
      </Shell>
    </ProtectedPage>
  );
}

const StatementCard = styled.section`
  padding: 32px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.default};
  backdrop-filter: blur(12px);
  color: ${({ theme }) => theme.colors.light};
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

  small {
    color: ${({ theme }) => theme.colors.inkSoft};
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const BalanceValue = styled.div`
  font-size: 2.4rem;
  font-weight: 700;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.primary};
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.borderLight)};
  border-radius: 999px;
  padding: 8px 18px;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'rgba(0, 0, 0, 0.2)')};
  color: ${({ $active, theme }) => ($active ? '#0b1325' : theme.colors.light)};
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.primaryDark : 'rgba(255, 255, 255, 0.1)')};
    transform: translateY(-2px);
  }
`;

const List = styled.div`
  display: grid;
  gap: 12px;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.03);
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }
`;

const TypeTitle = styled.strong`
  display: block;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.light};
`;

const Meta = styled.div`
  margin-top: 4px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

const Description = styled.p`
  margin: 6px 0 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
`;

const Value = styled.strong`
  font-size: 1.15rem;
  color: ${({ $direction, theme }) =>
    $direction === 'debit' ? theme.colors.danger : theme.colors.success};
  white-space: nowrap;
`;

const EmptyMessage = styled.p`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.colors.inkSoft};
  background: rgba(0, 0, 0, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-top: 32px;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 0.95rem;
`;

const PageButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 999px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  color: ${({ theme }) => theme.colors.light};
  transition: all 0.2s ease;

  &:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;