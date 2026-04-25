import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
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
        message: 'Usuário e senha precisam ser preenchidos'
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
        message: error.response?.data?.message || 'Credenciais inválidas'
      });
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!registerForm.name) nextErrors.name = 'Nome não pode ser vazio';
    if (!registerForm.email) nextErrors.email = 'Email não pode ser vazio';
    if (!registerForm.cpf) nextErrors.cpf = 'CPF não pode ser vazio';
    if (!registerForm.password) nextErrors.password = 'Senha não pode ser vazio';
    if (!registerForm.confirmPassword) {
      nextErrors.confirmPassword = 'Confirmar senha não pode ser vazio';
    }

    if (registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      nextErrors.email = 'Formato de e-mail inválido';
    }

    if (registerForm.password && registerForm.password.length < 6) {
      nextErrors.password = 'Senha deve conter no mínimo 6 caracteres';
    }

    if (
      registerForm.password &&
      registerForm.confirmPassword &&
      registerForm.password !== registerForm.confirmPassword
    ) {
      nextErrors.confirmPassword = 'As senhas precisam ser iguais';
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
        message: `Conta criada com sucesso. Número da conta: ${data.accountNumber}-${data.accountDigit}`
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha no cadastro',
        message: error.response?.data?.message || 'Não foi possível criar a conta'
      });
    }
  }

  return (
    <>
      <Page>
        <HeroCard>
          <img src="/brand/m3-logo2.png" alt="M3 Bank" />
          <h2>Sabor banco.</h2>
          <p>
            Faça login, cadastre contas, execute transferências, valide limite noturno e simule
            pagamentos Pix com QR Code estático em uma interface própria, depositos e perfil do usuário
          </p>
        </HeroCard>

        <AuthCard>
          <Tabs>
            <TabButton
              type="button"
              $active={mode === 'login'}
              onClick={() => setMode('login')}
            >
              Entrar
            </TabButton>
            <TabButton
              type="button"
              $active={mode === 'register'}
              onClick={() => setMode('register')}
            >
              Cadastrar
            </TabButton>
          </Tabs>

          {mode === 'login' ? (
            <Form onSubmit={handleLogin}>
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
              <PrimaryButton type="submit">Acessar dashboard</PrimaryButton>
            </Form>
          ) : (
            <Form onSubmit={handleRegister}>
              <Field
                label="Nome"
                value={registerForm.name}
                onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                error={errors.name}
              />
              <Field
                label="E-mail"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                error={errors.email}
              />
              <Field
                label="CPF"
                value={registerForm.cpf}
                onChange={(event) => setRegisterForm({ ...registerForm, cpf: event.target.value })}
                error={errors.cpf}
              />
              <Field
                label="Senha"
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                error={errors.password}
              />
              <Field
                label="Confirmar senha"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(event) =>
                  setRegisterForm({ ...registerForm, confirmPassword: event.target.value })
                }
                error={errors.confirmPassword}
              />
              <ToggleRow>
                <input
                  checked={registerForm.createWithBalance}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, createWithBalance: event.target.checked })
                  }
                  type="checkbox"
                />
                <span>Criar conta com saldo</span>
              </ToggleRow>
              <PrimaryButton type="submit">Criar conta</PrimaryButton>
            </Form>
          )}
        </AuthCard>
      </Page>

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

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  padding: 32px;
  gap: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const CardBase = styled.section`
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  box-shadow: ${({ theme }) => theme.shadow};
`;

const HeroCard = styled(CardBase)`
  padding: 48px;
  display: grid;
  align-content: end;
  min-height: 70vh;
  background:
    radial-gradient(circle at top right, rgba(255, 211, 78, 0.16), transparent 26%),
    linear-gradient(140deg, rgba(255, 211, 78, 0.08), rgba(16, 26, 51, 0.24));

  img {
    width: min(100%, 320px);
    margin-bottom: 20px;
  }

  h1 {
    margin: 0 0 16px;
    max-width: 14ch;
    font-size: clamp(2.4rem, 5vw, 4.5rem);
    line-height: 1;
  }

  p {
    margin: 0;
    max-width: 56ch;
    color: rgba(255, 255, 255, 0.84);
    line-height: 1.7;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  width: fit-content;
  margin-bottom: 18px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 211, 78, 0.14);
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid rgba(255, 211, 78, 0.22);
  font-size: 0.88rem;
  font-weight: 700;
`;

const AuthCard = styled(CardBase)`
  padding: 28px;
  align-self: center;
`;

const Tabs = styled.div`
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 24px;
`;

const TabButton = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 10px 18px;
  cursor: pointer;
  color: ${({ $active, theme }) => ($active ? theme.colors.ink : theme.colors.light)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
`;

const Form = styled.form`
  display: grid;
  gap: 16px;
`;

const PrimaryButton = styled.button`
  border: 0;
  border-radius: 16px;
  padding: 14px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.95;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.primary};
  }
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.88);
`;
