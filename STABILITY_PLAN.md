# Plano de Estabilização e Mapeamento do Sistema - FinanSmart

Este documento serve como a única fonte de verdade para o estado atual do sistema e o guia rigoroso para correções e testes. **O desenvolvimento de novas funcionalidades está congelado.**

## 1. Mapeamento de Telas e Funcionalidades

| Tela | Funcionalidade | Status Atual | Comportamento Esperado |
| :--- | :--- | :--- | :--- |
| **Landing Page** | Navegação, CTA, FAQ, Depoimentos | ✅ Estável | Navegar para /login ou /simulador. FAQ e depoimentos visíveis. |
| **Simulador** | Cálculos SAC/Price, Amortização Extra | ✅ Estável (Lógica) | Realizar cálculos precisos e mostrar resultados/gráficos. |
| **Simulador -> Lead** | Salvar Lead (Corretor) | ⚠️ Instável | Salvar dados do cliente e da simulação na tabela `leads`. |
| **Histórico** | Visualizar simulações passadas | ❌ Instável | Listar todas as simulações salvas no banco para o `user_id` logado. |
| **Login / Register** | Auth Email/Senha e Google | ✅ Funcional | Criar usuário no Auth e disparar gatilho para criar perfil no banco. |
| **Onboarding** | Escolha de tipo (Cliente/Corretor) | ⚠️ Crítico | Forçar seleção após login. Salvar `user_type` e `setup_completed`. |
| **Dashboard (Cliente)** | Resumo, Limites e Histórico | ⚠️ Instável | Mostrar contagem de simulações, plano e lista de histórico. |
| **Dashboard (Corretor)** | CRM / Gestão de Leads | ⚠️ Instável | Mostrar funil de vendas, valor de VGV e gestão de prospectos. |
| **Perfil (Geral)** | Gestão de Conta e Plano | ⚠️ Instável | Editar dados básicos e mostrar claramente o status do Plano PRO. |

## 2. Checklist de Estabilidade (Regression Test)

Este teste deve ser executado integralmente a cada alteração ou antes de qualquer commit:

- [ ] **Auth**: Login com e-mail funciona?
- [ ] **Auth**: Logout limpa a sessão e redireciona?
- [ ] **Google Login**: Cadastro novo força a tela de Onboarding?
- [ ] **Onboarding**: Escolha de perfil persiste no banco de dados?
- [ ] **Onboarding**: Usuário consegue burlar a tela via URL sem escolher perfil? (Não pode!)
- [ ] **Dados**: Ao terminar uma simulação logado, ela aparece instantaneamente no histórico?
- [ ] **Dados**: O botão "Ver Detalhes" no histórico reconstrói a simulação correta?
- [ ] **Dados**: O contador de simulações (1/5) incrementa corretamente?
- [ ] **Stripe**: Botão "Assinar PRO" redireciona para o checkout?
- [ ] **Stripe**: Após pagamento, o plano muda para 'PRO' sem intervenção manual?

## 3. Prioridades de Ação (Apenas Funcional)

1.  **BANCO & DADOS**: Corrigir salvamento e busca do histórico. Garantir que `user_id` está sendo amarrado corretamente nas tabelas `saved_simulations` e `leads`.
2.  **ONBOARDING**: Blindar a rota. Garantir que o `updateUserProfile` no Onboarding não falhe (resolver o erro de banco reportado).
3.  **LIMITE FREE (PAYWALL)**: Validar se o bloqueio de 5 simulações está rígido e funcional.
4.  **PERFIL FUNCIONAL**: Remover placeholders e garantir que o Painel de Controle mostre dados reais vindo do banco.

---
*Assinado: Antigravity - Foco em Estabilidade Máxima.*
