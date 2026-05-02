const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Importação do BCrypt
const pool = require('../db/pool');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { isValidEmail } = require('../utils/validators');
const userRepository = require('../repositories/userRepository');
const accountRepository = require('../repositories/accountRepository');
const statementRepository = require('../repositories/statementRepository');

const SALT_ROUNDS = 10; // Custo do processamento da criptografia

function buildAccountNumbers(userId) {
  const base = String(100000 + userId);
  const accountNumber = base.slice(-6);
  const digit = String((userId * 7) % 10);

  return {
    accountNumber,
    accountDigit: digit
  };
}

function buildToken(user, account) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      accountId: account.id
    },
    env.jwtSecret,
    { expiresIn: '1h' }
  );
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new AppError('Usuário e senha precisam ser preenchidos', 400);
  }

  const connection = await pool.getConnection();

  try {
    const user = await userRepository.findByEmail(connection, email);

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const lockUntil = user.bloqueado_ate ? new Date(user.bloqueado_ate) : null;
    if (lockUntil && lockUntil > new Date()) {
      throw new AppError('Muitas tentativas falhas. Tente novamente em 5 minutos.', 401);
    }

    // --- MUDANÇA AQUI: Comparação Criptografada ---
    const isPasswordValid = await bcrypt.compare(password, user.senha);

    if (!isPasswordValid) {
      const attempts = (user.tentativas_falha_login || 0) + 1;
      const shouldLock = attempts >= 3;
      const nextLock = shouldLock ? new Date(Date.now() + 5 * 60 * 1000) : null;

      await userRepository.updateLoginAttempts(connection, user.id, shouldLock ? 3 : attempts, nextLock);

      if (shouldLock) {
        throw new AppError('Muitas tentativas falhas. Tente novamente em 5 minutos.', 401);
      }

      throw new AppError('Credenciais inválidas', 401);
    }

    await userRepository.resetLoginAttempts(connection, user.id);

    const account = await accountRepository.findByUserId(connection, user.id);
    const token = buildToken(user, account);

    return {
      token,
      expiresIn: 3600,
      user: {
        id: user.id,
        name: user.nome,
        email: user.email
      },
      account: {
        id: account.id,
        number: account.numero_conta,
        digit: account.digito_conta,
        balance: account.saldo
      }
    };
  } finally {
    connection.release();
  }
}

async function register(payload) {
  const { name, email, password, confirmPassword, cpf, createWithBalance } = payload;

  // Validações de campos permanecem iguais...
  if (!name) throw new AppError('Nome não pode ser vazio', 400);
  if (!email) throw new AppError('Email não pode ser vazio', 400);
  if (!password) throw new AppError('Senha não pode ser vazio', 400);
  if (!confirmPassword) throw new AppError('Confirmar senha não pode ser vazio', 400);
  if (!isValidEmail(email)) throw new AppError('Formato de e-mail inválido', 400);
  if (password.length < 6) throw new AppError('Senha deve conter no mínimo 6 caracteres', 400);
  if (password !== confirmPassword) throw new AppError('As senhas precisam ser iguais', 400);
  if (!cpf) throw new AppError('CPF é obrigatório', 400);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const existingUser = await userRepository.findByEmail(connection, email);
    if (existingUser) {
      throw new AppError('E-mail já cadastrado', 400);
    }

    // --- MUDANÇA AQUI: Hash da senha antes de salvar ---
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = await userRepository.create(connection, {
      name,
      email,
      password: passwordHash, // Salva o hash
      cpf
    });

    const { accountNumber, accountDigit } = buildAccountNumbers(userId);
    const initialBalance = createWithBalance ? 1000 : 0;
    const accountId = await accountRepository.create(connection, userId, accountNumber, accountDigit, initialBalance);

    await statementRepository.createEntry(connection, {
      accountId,
      direction: 'credit',
      entryType: 'Abertura de conta',
      amount: initialBalance,
      description: 'Conta criada no M3 Bank',
      relatedAccount: null,
      favoredName: name
    });

    await connection.commit();

    return {
      message: 'Conta criada com sucesso',
      accountNumber,
      accountDigit,
      initialBalance
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new AppError('Token inválido ou expirado', 401);
  }
}

async function updateProfile(userId, payload) {
  const { name, currentPassword, newPassword } = payload;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const user = await userRepository.findById(connection, userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (name !== undefined) {
      if (!name.trim()) throw new AppError('Nome não pode ser vazio', 400);
      if (name.trim().length < 2) throw new AppError('Nome deve ter pelo menos 2 caracteres', 400);
      await userRepository.updateName(connection, userId, name.trim());
    }

    if (newPassword !== undefined) {
      if (!currentPassword) throw new AppError('Senha atual é obrigatória', 400);

      // --- MUDANÇA AQUI: Validar senha atual com Bcrypt ---
      const isOldPasswordValid = await bcrypt.compare(currentPassword, user.senha);
      
      if (!isOldPasswordValid) {
        throw new AppError('Senha atual incorreta', 400);
      }

      if (!newPassword) throw new AppError('Nova senha é obrigatória', 400);
      if (newPassword.length < 6) throw new AppError('Nova senha deve ter pelo menos 6 caracteres', 400);

      // --- MUDANÇA AQUI: Hash da nova senha ---
      const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await userRepository.updatePassword(connection, userId, newPasswordHash);
    }

    await connection.commit();

    return {
      message: 'Perfil atualizado com sucesso'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  login,
  register,
  verifyToken,
  updateProfile
};