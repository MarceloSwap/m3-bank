# Execução Exploratória UI - SBTM

**Projeto:** M3 Bank  
**Data:** 06/05/2026  
**Ambiente:** API `http://localhost:3334` e Frontend `http://localhost:3000`  
**Branch:** `test/sbtm-test-charters-rn01-rn07`

## Resumo

Execução exploratória parcial via navegador, cobrindo os principais fluxos UI dos charters RN01 a RN07. Não foi identificado bug funcional novo nesta rodada. Os charters do Jira receberam comentários com os resultados e caminhos das evidências locais.

## Evidências

| RN | Jira | Resultado observado | Evidências |
|----|------|---------------------|------------|
| RN01 | M3-40 | Cadastro validou campos obrigatórios e criou conta com sucesso | `RN01-cadastro-campos-obrigatorios.png`, `RN01-cadastro-sucesso.png` |
| RN02 | M3-41 | Login válido carregou Home com conta e saldo | `RN02-login-senha-incorreta.png`, `RN02-login-sucesso-home.png` |
| RN03 | M3-42 | Transferência de R$ 150,00 concluída com sucesso | `RN03-transferencia-sucesso.png` |
| RN04 | M3-43 | Depósito de R$ 250,00 concluído; R$ 9,99 bloqueado por limite mínimo | `RN04-deposito-sucesso.png`, `RN04-deposito-limite-inferior.png` |
| RN05 | M3-44 | Pix simulado de R$ 50,00 concluído e refletido no extrato | `RN05-pix-sucesso.png` |
| RN06 | M3-45 | Extrato exibiu saldo, filtros e lançamentos com sinais financeiros | `RN06-extrato-saldo-filtros.png` |
| RN07 | M3-46 | Nome inválido exibiu validação; nome válido exibiu sucesso | `RN07-perfil-nome-invalido.png`, `RN07-perfil-nome-sucesso.png` |

## Observações

- RN03 limite noturno e token inválido permanecem como foco para sessão manual completa com massa/saldo/horário apropriados.
- O console do navegador apresentou warning de HMR do Next.js em desenvolvimento durante o extrato; não foi tratado como bug funcional.
- As evidências foram salvas localmente porque o conector Jira disponível não expôs upload direto de anexos.
