import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';

const shortcuts = [
  { href: '/transferencia', label: 'Transferências', image: '/icons/shortcut-transfer.svg', accent: '#5cc8ff' },
  { href: '/pagamentos', label: 'Pagamentos', image: '/icons/shortcut-payments.svg', accent: '#7df9a6' },
  { href: '/deposito', label: 'Depósito', image: '/icons/shortcut-deposit.svg', accent: '#ffd166' },
  { href: '/extrato', label: 'Extrato', image: '/icons/shortcut-statement.svg', accent: '#c6a0ff' },
  { href: '/perfil', label: 'Perfil', image: '/icons/shortcut-profile.svg', accent: '#ff9ecb' }
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
        title={`Olá ${session?.user?.name || ''}, bem-vindo!`}
        subtitle="Para exercitar seus cenários de automação com mais cara de produto real."
      >
        <BalanceCard>
          <small>Saldo disponível atualizado</small>
          <strong>
            {Number(session?.account?.balance || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </strong>
        </BalanceCard>

        <ShortcutGrid>
          {shortcuts.map((item) => (
            <Link href={item.href} key={item.href}>
              <ShortcutCard>
                <IconBadge aria-hidden="true" style={{ '--accent': item.accent }}>
                  <IconImage src={item.image} alt="" />
                </IconBadge>
                <ShortcutLabel>{item.label}</ShortcutLabel>
              </ShortcutCard>
            </Link>
          ))}
        </ShortcutGrid>

        <Panel>
          <PanelTitle>Movimentações recentes</PanelTitle>
          {recent.length === 0 ? (
            <EmptyText>Nenhuma movimentação recente encontrada.</EmptyText>
          ) : (
            recent.map((entry) => (
              <Row key={entry.id}>
                <div>
                  <TypeTitle>{entry.type}</TypeTitle>
                  <p>
                    {entry.description || '-'}
                    {entry.relatedAccount && entry.relatedAccount !== 'QR ESTATICO'
                      ? ` • Conta: ${entry.relatedAccount}`
                      : ''}
                  </p>
                </div>
                <Amount $direction={entry.direction}>
                  {entry.direction === 'debit' ? '(-) ' : ''}
                  {Number(entry.amount).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Amount>
              </Row>
            ))
          )}
        </Panel>
      </Shell>
    </ProtectedPage>
  );
}

const BalanceCard = styled.section`
  padding: 32px;
  border-radius: ${({ theme }) => theme.radius.lg};
  /* Usando o dourado da logo com transparência para o efeito de vidro */
  background: linear-gradient(135deg, rgba(240, 208, 100, 0.15), rgba(240, 208, 100, 0.05));
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.primary};
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(240, 208, 100, 0.25);
  }

  small {
    display: block;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.inkSoft};
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.3s ease;
  }

  &:hover small {
    color: ${({ theme }) => theme.colors.light};
  }

  strong {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    color: ${({ theme }) => theme.colors.primary};
    transition: color 0.3s ease;
  }

  &:hover strong {
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ShortcutGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr)); /* Mudado para 5 colunas se couber */
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ShortcutCard = styled.a`
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ theme }) => theme.shadows.default};
  backdrop-filter: blur(12px);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.hover};
    background: rgba(26, 35, 56, 0.9);
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }

`;

const IconBadge = styled.span`
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(145deg, color-mix(in srgb, var(--accent, #f0d064) 26%, transparent), rgba(255, 255, 255, 0.04));
  border: 1px solid color-mix(in srgb, var(--accent, #f0d064) 60%, transparent);
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent, #f0d064) 35%, transparent);
  transition: transform 0.3s ease;

  ${ShortcutCard}:hover & {
    transform: scale(1.08);
  }
`;

const IconImage = styled.img`
  width: 60px;
  height: 60px;
  display: block;
  filter: drop-shadow(0 0 6px rgba(240, 208, 100, 0.2));
`;

const ShortcutLabel = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.ink};
  transition: color 0.3s ease;
  text-align: center;

  ${ShortcutCard}:hover & {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Panel = styled.section`
  padding: 32px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
  box-shadow: ${({ theme }) => theme.shadows.default};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const PanelTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.light};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.inkSoft};
  background: rgba(0, 0, 0, 0.15);
  padding: 24px;
  border-radius: ${({ theme }) => theme.radius.sm};
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all 0.2s ease;
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 16px;
  margin: 4px 0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.25);
    transform: translateX(4px);
    border-color: transparent;
  }

  p {
    margin: 4px 0 0;
    color: ${({ theme }) => theme.colors.inkSoft};
    font-size: 0.9rem;
    transition: color 0.2s ease;
  }

  &:hover p {
    color: ${({ theme }) => theme.colors.light};
  }
`;

const TypeTitle = styled.strong`
  color: ${({ theme }) => theme.colors.light};
  font-size: 1.05rem;
`;

const Amount = styled.span`
  color: ${({ $direction, theme }) =>
    $direction === 'debit' ? theme.colors.danger : theme.colors.success};
  font-weight: 700;
  font-size: 1.1rem;
  transition: transform 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: scale(1.05);
  }
`;