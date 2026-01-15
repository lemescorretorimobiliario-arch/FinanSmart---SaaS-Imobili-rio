# 🚀 Guia Completo de Deploy - FinanSmart

Este guia passo a passo ensina como colocar seu sistema SaaS no ar usando **Supabase** (Backend/Banco) e **Vercel** (Frontend).

---

## 📦 Parte 1: Configuração do Supabase (Backend)

O Supabase será responsável pelo Banco de Dados, Autenticação e Funções Serverless (para o Stripe).

### 1. Criar Projeto
1. Acesse [database.new](https://database.new) e crie um novo projeto.
2. Defina uma senha forte para o banco de dados (guarde-a).
3. Aguarde o provisionamento.

### 2. Configurar Autenticação
1. No menu lateral, vá em **Authentication** > **Providers**.
2. **Email/Password**: Certifique-se de que está habilitado.
3. **Google** (Opcional, mas recomendado):
   - Habilite e adicione o `Client ID` e `Client Secret` do Google Cloud Console.
   - Adicione a URL de callback do Supabase no Google Console.

### 3. Criar Tabelas (Banco de Dados)
Vá em **SQL Editor** e rode o script de criação das tabelas. Se você ainda não tem o script consolidado, aqui está a estrutura essencial baseada no código:

```sql
-- Profiles (Extensão da Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  user_type text default 'CLIENTE', -- 'CLIENTE' ou 'CORRETOR'
  plan text default 'FREE', -- 'FREE' ou 'PRO'
  simulations_count int default 0,
  stripe_customer_id text,
  subscription_id text,
  subscription_status text,
  setup_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id),
  name text not null,
  email text,
  phone text,
  interest text,
  status text default 'NOVO',
  simulation_data jsonb,
  created_at timestamptz default now()
);

-- Saved Simulations
create table public.saved_simulations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  property_value numeric,
  down_payment numeric,
  term_years int,
  monthly_payment numeric,
  interest_rate_annual numeric,
  amortization_system text,
  monthly_income numeric,
  created_at timestamptz default now()
);

-- Ativar Row Level Security (RLS) se necessário, ou criar policies básicas.
```

### 4. Deploy das Edge Functions (Stripe)
Você precisará do **Supabase CLI** instalado no seu computador.

1. **Login no CLI:**
   ```bash
   npx supabase login
   ```
2. **Linkar Projeto:**
   Pegue o `Reference ID` do seu projeto no painel do Supabase (está na URL: `app.supabase.com/project/seu-id-aqui`).
   ```bash
   npx supabase link --project-ref seu-id-aqui
   ```
3. **Definir Segredos (Variáveis de Ambiente do Backend):**
   No painel do Supabase (ou via CLI), vá em **Settings > Edge Functions** e adicione:
   - `STRIPE_SECRET_KEY`: Sua chave secreta do Stripe (`sk_...`).
   - `STRIPE_WEBHOOK_SECRET`: O segredo do webhook do Stripe (veja abaixo como pegar).
   - `SUPABASE_URL`: URL do seu projeto.
   - `SUPABASE_SERVICE_ROLE_KEY`: Chave `service_role` (NÃO a anon).

4. **Deploy:**
   ```bash
   npx supabase functions deploy create-checkout-session
   npx supabase functions deploy stripe-webhook
   ```

### 5. Configurar Webhook no Stripe
1. Vá no Dashboard do Stripe > Developers > Webhooks.
2. Adicione um endpoint: `https://<seu-projeto>.supabase.co/functions/v1/stripe-webhook`.
3. Selecione os eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o "Signing Secret" (`whsec_...`) e coloque na variável `STRIPE_WEBHOOK_SECRET` do Supabase (passo anterior).

---

## 🚀 Parte 2: Configuração da Vercel (Frontend)

### 1. Importar Projeto
1. Crie conta na [Vercel](https://vercel.com).
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o repositório do GitHub onde está o código.

### 2. Configurações de Build
A Vercel geralmente detecta Vite automaticamente.
- **Framework Preset:** Vite
- **Root Directory:** `./` (ou raiz)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3. Variáveis de Ambiente (Environment Variables)
Adicione estas variáveis nas configurações do projeto na Vercel:

| Variável | Valor | Onde pegar? |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://<seu-id>.supabase.co` | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (Chave pública) | Supabase > Settings > API |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` (ou live) | Stripe Dashboard |
| `VITE_STRIPE_PRICE_ID` | `price_...` | ID do Preço do produto no Stripe |

### 4. Deploy
1. Clique em **Deploy**.
2. Aguarde a finalização.
3. Acesse a URL gerada (ex: `finansmart.vercel.app`).

---

## 🔄 Parte 3: Configuração Final (Pós-Deploy)

1. **Atualizar URL no Supabase Auth:**
   - Volte no Supabase > Authentication > URL Configuration.
   - Em **Site URL**, coloque a URL da Vercel (ex: `https://finansmart.vercel.app`).
   - Em **Redirect URLs**, adicione `https://finansmart.vercel.app/**`.

2. **Atualizar URL no Stripe (Para Produção):**
   - Se estiver usando chaves de produção (`pk_live`, `sk_live`), certifique-se de que o Stripe está ativado.
   - Verifique se os produtos e preços existem no modo Live.

---

## 🛠 Comandos Úteis

```bash
# Rodar localmente
npm run dev

# Fazer build local para teste
npm run build
npm run preview

# Deploy das functions (se alterar algo)
npx supabase functions deploy <nome-da-funcao>
```
