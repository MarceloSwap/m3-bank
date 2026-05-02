import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Field from '../src/components/Field';
import Modal from '../src/components/Modal';
import { useAuth } from '../src/context/AuthContext';

const emptyRegister = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  cpf: '',
  createWithBalance: true
};

export default function IndexPage() {
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [modal, setModal] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  async function handleLogin(event) {
    event.preventDefault();
    setErrors({});

    if (!loginForm.email || !loginForm.password) {
      setModal({
        type: 'error',
        title: 'Login',
        message: 'Usuario e senha precisam ser preenchidos'
      });
      return;
    }

    try {
      await login(loginForm);
      router.push('/home');
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha no login',
        message: error.response?.data?.message || 'Credenciais invalidas'
      });
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!registerForm.name) nextErrors.name = 'Nome nao pode ser vazio';
    if (!registerForm.email) nextErrors.email = 'Email nao pode ser vazio';
    if (!registerForm.cpf) nextErrors.cpf = 'CPF nao pode ser vazio';
    if (!registerForm.password) nextErrors.password = 'Senha nao pode ser vazio';
    if (!registerForm.confirmPassword) {
      nextErrors.confirmPassword = 'Confirmar senha nao pode ser vazio';
    }

    if (registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      nextErrors.email = 'Formato de e-mail invalido';
    }

    if (registerForm.password && registerForm.password.length < 6) {
      nextErrors.password = 'Senha deve conter no minimo 6 caracteres';
    }

    if (
      registerForm.password &&
      registerForm.confirmPassword &&
      registerForm.password !== registerForm.confirmPassword
    ) {
      nextErrors.confirmPassword = 'As senhas nao coincidem';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const data = await register(registerForm);

      setRegisterForm(emptyRegister);
      setMode('login');
      setModal({
        type: 'success',
        title: 'Cadastro realizado',
        message: `Conta criada com sucesso. Numero da conta: ${data.accountNumber}-${data.accountDigit}`
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha no cadastro',
        message: error.response?.data?.message || 'Nao foi possivel criar a conta'
      });
    }
  }

  return (
    <>
      <div className="auth-page">
        <section className="auth-hero">
          <img src="/brand/m3-logo2.png" alt="M3 Bank" />
          <h2>Sabor banco.</h2>
          <p>
            Faca login, cadastre contas, execute transferencias, valide limite noturno e simule
            pagamentos Pix com QR Code estatico em uma interface limpa para QA.
          </p>
        </section>

        <section className="auth-card">
          <div className="tabs">
            <button
              type="button"
              className={`button-tab${mode === 'login' ? ' button-tab--active' : ''}`}
              onClick={() => setMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`button-tab${mode === 'register' ? ' button-tab--active' : ''}`}
              onClick={() => setMode('register')}
            >
              Cadastrar
            </button>
          </div>

          {mode === 'login' ? (
            <form className="form" onSubmit={handleLogin}>
              <Field
                label="E-mail"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="voce@m3bank.test"
              />
              <Field
                label="Senha"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="********"
              />
              <button className="button-primary" type="submit">Acessar dashboard</button>
            </form>
          ) : (
            <form className="form" onSubmit={handleRegister}>
              <Field label="Nome" value={registerForm.name} onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })} error={errors.name} />
              <Field label="E-mail" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} error={errors.email} />
              <Field label="CPF" value={registerForm.cpf} onChange={(event) => setRegisterForm({ ...registerForm, cpf: event.target.value })} error={errors.cpf} />
              <Field label="Senha" type="password" value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} error={errors.password} />
              <Field label="Confirmar senha" type="password" value={registerForm.confirmPassword} onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })} error={errors.confirmPassword} />
              <label className="toggle-row">
                <input
                  checked={registerForm.createWithBalance}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, createWithBalance: event.target.checked })
                  }
                  type="checkbox"
                />
                <span>Criar conta com saldo</span>
              </label>
              <button className="button-primary" type="submit">Criar conta</button>
            </form>
          )}
        </section>
      </div>

      {modal ? (
        <Modal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}
