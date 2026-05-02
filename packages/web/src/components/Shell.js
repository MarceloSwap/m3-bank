import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Shell({ title, subtitle, children, headerAction }) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showBackButton = router.pathname !== '/home';

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    logout();
    router.push('/');
  }

  return (
    <div className="shell">
      <header className="shell__header">
        <Link href="/home">
          <img className="shell__logo" src="/brand/m3-logo2.png" alt="M3 Bank" />
        </Link>
        <div className="shell__actions">
          {showBackButton ? (
            <button className="button-back" type="button" onClick={() => router.back()}>
              Voltar
            </button>
          ) : null}
          {headerAction || null}
          <span className="shell__account">
            {session?.account?.number}-{session?.account?.digit}
          </span>
          <button className="button-ghost" type="button" onClick={() => setShowLogoutConfirm(true)}>
            Sair
          </button>
        </div>
      </header>

      <section className="shell__hero">
        <div>
          <span className="shell__eyebrow">M3 Bank</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </section>

      <main className="shell__content">{children}</main>

      {showLogoutConfirm && (
        <div className="confirm">
          <div className="confirm__content">
            <h2>Confirmar saida</h2>
            <p>Voce tem certeza que deseja sair da aplicacao?</p>
            <div className="confirm__actions">
              <button className="confirm__button" onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
              <button className="confirm__button confirm__button--primary" onClick={handleConfirmLogout}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
