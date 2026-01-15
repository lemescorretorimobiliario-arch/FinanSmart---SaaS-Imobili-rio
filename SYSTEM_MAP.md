# MAPEAMENTO DO SISTEMA FINANSMART

## 1. Telas do Sistema (Files vs Rotas)

| Rota | Componente | Status Atual | Descrição |
|---|---|---|---|
| `/` | `LandingPage.tsx` | ✅ Funcional | Página inicial pública. |
| `/simulador` | `App.tsx` (Split View) | ✅ Funcional | Tela principal. Contém `CalculatorForm` e `ResultDashboard`. Adaptação mobile via tabs. |
| `/login` | `AuthScreen.tsx` | ✅ Funcional | Login Email/Senha e Google. |
| `/onboarding` | `OnboardingScreen.tsx` | ✅ Funcional | Seleção obrigatória de tipo de usuário (Cliente/Corretor) pós-cadastro. |
| `/dashboard` | `AgentDashboard.tsx` / `ClientDashboard.tsx` | ⚠️ A Verificar | Painel restrito. Exibe histórico ou leads. |
| `/profile` | `UserProfilePanel.tsx` | ⚠️ A Verificar | Gerenciamento de conta, plano e dados pessoais. |

## 2. Funcionalidades & Status

### Autenticação & Perfil (Prioridade 2)
- **Login Email/Senha**: Codificado em `utils/auth.ts`.
- **Login Google**: Codificado em `utils/auth.ts` + Supabase Auth.
- **Onboarding (Tipo de Usuário)**: Implementado e forçado via `App.tsx` redirect.
- **Perfil do Usuário**: Exibido no Header e em `/profile`. Precisa verificar se mostra "Simulações Restantes".

### Curso Principal (Prioridade 3)
- **Simulação**: `utils/finance.ts` (Cálculo SAC/Price). Funciona.
- **Histórico**: `App.tsx` salva em `saved_simulations`. Precisa verificar se o Dashboard carrega isso de volta.
- **Limites (Free)**: `App.tsx` verifica `simulationsCount < 5`. `PaywallModal.tsx` exibe bloqueio.

### Integrações (Prioridade 4)
- **Supabase**: Configurado em `utils/supabaseClient.ts`.
- **Stripe**: `utils/stripePayment.ts` e Edge Functions. Fluxo de Checkout iniciado.
- **PDF**: `utils/pdfGenerator.ts`. Usado por corretores.

## 3. Estrutura de Dados (Inferida)

- **Tabela `profiles`**: Dados do usuário, plano, contadores.
- **Tabela `saved_simulations`**: Histórico de cálculos.
- **Tabela `leads`**: Clientes captados por corretores.

## 4. O que precisa de correção (Baseado na Análise Estática)

1. **Dashboard de Cliente (`ClientDashboard`)**: Verificar se carrega e exibe o histórico de `saved_simulations`.
2. **Dashboard de Corretor (`AgentDashboard`)**: Verificar se carrega e exibe status dos leads.
3. **Feedback Visual**: Garantir que `sonner` (Toast) está sendo usado em todas as interações de erro/sucesso.
