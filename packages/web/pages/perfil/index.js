import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setForm((previous) => ({ ...previous, name: session?.user?.name || '' }));
  }, [session?.user?.name]);

  async function handleUpdateName(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Nome nao pode ser vazio';
    if (form.name.trim().length < 2) nextErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await api.put('/auth/profile', { name: form.name.trim() });
      await refreshAccount();
      setModal({ type: 'success', title: 'Perfil atualizado', message: 'Nome atualizado com sucesso!' });
    } catch (error) {
      setModal({ type: 'error', title: 'Falha na atualizacao', message: error.response?.data?.message || 'Nao foi possivel atualizar o nome' });
    }
  }

  async function handleUpdatePassword(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = 'Senha atual e obrigatoria';
    if (!form.newPassword) nextErrors.newPassword = 'Nova senha e obrigatoria';
    if (form.newPassword && form.newPassword.length < 6) nextErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirmacao de senha e obrigatoria';
    if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = 'As senhas nao coincidem';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await api.put('/auth/profile', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
      setModal({ type: 'success', title: 'Senha atualizada', message: 'Senha alterada com sucesso!' });
    } catch (error) {
      setModal({ type: 'error', title: 'Falha na atualizacao', message: error.response?.data?.message || 'Nao foi possivel alterar a senha' });
    }
  }

  return (
    <ProtectedPage>
      <Shell title="Meu Perfil" subtitle="Gerencie informacoes pessoais e configuracoes de seguranca.">
        <section className="profile">
          <div className="profile__tabs">
            <button className={`button-tab${activeTab === 'name' ? ' button-tab--active' : ''}`} type="button" onClick={() => setActiveTab('name')}>
              Alterar Nome
            </button>
            <button className={`button-tab${activeTab === 'password' ? ' button-tab--active' : ''}`} type="button" onClick={() => setActiveTab('password')}>
              Alterar Senha
            </button>
          </div>

          {activeTab === 'name' && (
            <form className="form-card" onSubmit={handleUpdateName}>
              <Field label="Nome completo" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} error={errors.name} />
              <button className="button-primary" type="submit">Atualizar Nome</button>
            </form>
          )}

          {activeTab === 'password' && (
            <form className="form-card" onSubmit={handleUpdatePassword}>
              <Field label="Senha atual" type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} error={errors.currentPassword} />
              <Field label="Nova senha" type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} error={errors.newPassword} />
              <Field label="Confirmar nova senha" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} error={errors.confirmPassword} />
              <button className="button-primary" type="submit">Alterar Senha</button>
            </form>
          )}
        </section>

        {modal ? <Modal type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal(null)} /> : null}
      </Shell>
    </ProtectedPage>
  );
}
