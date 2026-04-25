-- Script DDL para recriar o banco de dados M3 Bank em português
-- Este script cria todas as tabelas necessárias com nomes e colunas em português

CREATE DATABASE IF NOT EXISTS m3_bank;
USE m3_bank;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha VARCHAR(120) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rua VARCHAR(160) NOT NULL,
  bairro VARCHAR(120) NOT NULL,
  cidade VARCHAR(120) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(12) NOT NULL,
  tentativas_falha_login INT NOT NULL DEFAULT 0,
  bloqueado_ate DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas
CREATE TABLE IF NOT EXISTS contas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  numero_conta VARCHAR(10) NOT NULL UNIQUE,
  digito_conta VARCHAR(2) NOT NULL,
  saldo DECIMAL(12,2) NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contas_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- Tabela de transferências
CREATE TABLE IF NOT EXISTS transferencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conta_origem_id INT NOT NULL,
  conta_destino_id INT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  token_autorizacao_usado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transferencia_origem
    FOREIGN KEY (conta_origem_id) REFERENCES contas(id),
  CONSTRAINT fk_transferencia_destino
    FOREIGN KEY (conta_destino_id) REFERENCES contas(id)
);

-- Tabela de depósitos
CREATE TABLE IF NOT EXISTS depositos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conta_id INT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_deposito_conta
    FOREIGN KEY (conta_id) REFERENCES contas(id)
);

-- Tabela de pagamentos PIX
CREATE TABLE IF NOT EXISTS pagamentos_pix (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conta_id INT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  referencia_qr_code VARCHAR(255) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagamento_pix_conta
    FOREIGN KEY (conta_id) REFERENCES contas(id)
);

-- Tabela de lançamentos (ledger entries)
CREATE TABLE IF NOT EXISTS lancamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conta_id INT NOT NULL,
  direcao VARCHAR(10) NOT NULL,
  tipo_lancamento VARCHAR(60) NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  descricao VARCHAR(255) NULL,
  conta_relacionada VARCHAR(20) NULL,
  nome_favorecido VARCHAR(120) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lancamento_conta
    FOREIGN KEY (conta_id) REFERENCES contas(id)
    ON DELETE CASCADE
);