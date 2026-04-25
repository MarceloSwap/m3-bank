import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

export default function Shell({ title, subtitle, children, headerAction }) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showBackButton = router.pathname !== '/home';

  function handleLogoutClick() {
    setShowLogoutConfirm(true);
  }

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    logout();
    router.push('/');
  }

  return (
    <Page>
      <Header>
        <Link href="/home">
          {/* Pode manter a logo que desejar aqui */}
          <img src="/brand/m3-logo2.png" alt="M3 Bank" style={{ height: '40px', width: 'auto' }} />
        </Link>
        <Actions>
          {showBackButton ? (
            <BackButton type="button" onClick={() => router.back()}>
              ← Voltar
            </BackButton>
          ) : null}
          {headerAction || null}
          <AccountBadge>
            {session?.account?.number}-{session?.account?.digit}
          </AccountBadge>
          <GhostButton type="button" onClick={handleLogoutClick}>
            Sair
          </GhostButton>
        </Actions>
      </Header>

      <Hero>
        <div>
          <Eyebrow>M3 Bank</Eyebrow>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </Hero>

      <Content>{children}</Content>

      {showLogoutConfirm && (
        <ConfirmModal>
          <ConfirmContent>
            <h2>Confirmar saída</h2>
            <p>Você tem certeza que deseja sair da aplicação?</p>
            <ConfirmActions>
              <ConfirmButton $primary={false} onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </ConfirmButton>
              <ConfirmButton $primary={true} onClick={handleConfirmLogout}>
                Sair
              </ConfirmButton>
            </ConfirmActions>
          </ConfirmContent>
        </ConfirmModal>
      )}
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  padding: 24px;
  /* Fundo claro removido daqui para deixar o GlobalStyle agir */
  transition: opacity 0.5s ease-in-out;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  
  /* Efeito Glassmorphism Escuro da Home */
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(12px);
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 16px 24px;
  box-shadow: ${({ theme }) => theme.shadows.default};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};

  @media (max-width: 780px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 780px) {
    justify-content: space-between;
  }
`;

const AccountBadge = styled.span`
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(240, 208, 100, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
`;

const GhostButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 999px;
  padding: 8px 20px;
  background: transparent;
  color: ${({ theme }) => theme.colors.light};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: transparent;
  color: ${({ theme }) => theme.colors.light};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateX(-2px);
  }
`;

const Hero = styled.section`
  display: grid;
  gap: 12px;
  margin-bottom: 32px;

  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    color: ${({ theme }) => theme.colors.light};
  }

  p {
    margin: 8px 0 0;
    max-width: 720px;
    color: ${({ theme }) => theme.colors.inkSoft};
    line-height: 1.6;
  }
`;

const Eyebrow = styled.span`
  display: inline-block;
  margin-bottom: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
`;

const Content = styled.main`
  display: grid;
  gap: 24px;
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 32px;
  max-width: 400px;
  width: 90%;
  backdrop-filter: blur(18px);
  box-shadow: ${({ theme }) => theme.shadows.hover};

  h2 {
    margin: 0 0 12px;
    color: ${({ theme }) => theme.colors.light};
    font-size: 1.25rem;
  }

  p {
    margin: 0 0 24px;
    color: ${({ theme }) => theme.colors.inkSoft};
    line-height: 1.5;
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${({ $primary, theme }) =>
    $primary
      ? `
    background: ${theme.colors.primary};
    color: ${theme.colors.secondary};
    border-color: ${theme.colors.primary};
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: ${theme.shadows.primary};
    }
  `
      : `
    background: transparent;
    color: ${theme.colors.light};
    border-color: ${theme.colors.borderLight};
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: ${theme.colors.light};
    }
  `}
`;