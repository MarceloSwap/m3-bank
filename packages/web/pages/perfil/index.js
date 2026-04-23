import { useState } from 'react';
import styled from 'styled-components';
import Field from '../../src/components/Field';
import Modal from '../../src/components/Modal';
import ProtectedPage from '../../src/components/ProtectedPage';
import Shell from '../../src/components/Shell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function ProfilePage() {
  const { session, refreshAccount } = useAuth();
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState('name');

  async function handleUpdateName(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Nome não pode ser vazio';
    }

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const { data } = await api.put('/auth/profile', {
        name: form.name.trim()
      });

      await refreshAccount();
      setModal({
        type: 'success',
        title: 'Perfil atualizado',
        message: 'Nome atualizado com sucesso!'
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha na atualização',
        message: error.response?.data?.message || 'Não foi possível atualizar o nome'
      });
    }
  }

  async function handleUpdatePassword(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.currentPassword) {
      nextErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!form.newPassword) {
      nextErrors.newPassword = 'Nova senha é obrigatória';
    }

    if (form.newPassword && form.newPassword.length < 6) {
      nextErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    }

    if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const { data } = await api.put('/auth/profile', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      setForm({
        ...form,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setModal({
        type: 'success',
        title: 'Senha atualizada',
        message: 'Senha alterada com sucesso!'
      });
    } catch (error) {
      setModal({
        type: 'error',
        title: 'Falha na atualização',
        message: error.response?.data?.message || 'Não foi possível alterar a senha'
      });
    }
  }

  return (
    <ProtectedPage>
      <Shell
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais e configurações de segurança."
      >
        <ProfileContainer>
          <TabContainer>
            <TabButton
              $active={activeTab === 'name'}
              onClick={() => setActiveTab('name')}
            >
              Alterar Nome
            </TabButton>
            <TabButton
              $active={activeTab === 'password'}
              onClick={() => setActiveTab('password')}
            >
              Alterar Senha
            </TabButton>
          </TabContainer>

          {activeTab === 'name' && (
            <FormCard onSubmit={handleUpdateName}>
              <Field
                label="Nome completo"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                error={errors.name}
              />
              <SubmitButton type="submit">Atualizar Nome</SubmitButton>
            </FormCard>
          )}

          {activeTab === 'password' && (
            <FormCard onSubmit={handleUpdatePassword}>
              <Field
                label="Senha atual"
                type="password"
                value={form.currentPassword}
                onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
                error={errors.currentPassword}
              />
              <Field
                label="Nova senha"
                type="password"
                value={form.newPassword}
                onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
                error={errors.newPassword}
              />
              <Field
                label="Confirmar nova senha"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                error={errors.confirmPassword}
              />
              <SubmitButton type="submit">Alterar Senha</SubmitButton>
            </FormCard>
          )}
        </ProfileContainer>

        {modal && (
          <Modal
            type={modal.type}
            title={modal.title}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        )}
      </Shell>
    </ProtectedPage>
  );
}

const ProfileContainer = styled.div`
  max-width: 500px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.14)'};
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.06)'};
  color: ${({ theme, $active }) => $active ? theme.colors.ink : theme.colors.light};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $active }) => $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const FormCard = styled.form`
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: grid;
  gap: 24px;
`;

const SubmitButton = styled.button`
  padding: 14px 24px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.ink};
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;