# Sistema de Gestão Imobiliária

Sistema completo com Portal Público e Painel Admin/CRM.

## Tecnologias

- **Frontend**: Next.js (App Router), Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (Integração configurada)
- **Mapas**: Google Maps Platform (Geocoding e Maps JS)
- **Ícones**: Lucide React

## Estrutura do Projeto

- `src/app/(public)`: Portal público (Home, Listagem de Imóveis, Detalhes).
- `src/app/(admin)`: Painel Administrativo (Dashboard, CRM, Cadastro de Imóveis).
- `src/components`: Componentes reutilizáveis (UI) e específicos (Admin, Public).
- `src/lib`: Utilitários e configurações (Supabase, Google Maps).

## Configuração

1. Clone o repositório.
2. Instale as dependências: `npm install`.
3. Configure as variáveis de ambiente em `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key
   ```
4. Execute: `npm run dev`.

## Funcionalidades

- **Busca de Imóveis**: Filtros por tipo, localização e preço.
- **Geocodificação Automática**: Ao cadastrar um imóvel, o endereço é convertido em coordenadas.
- **Dashboard**: Métricas de leads e visualizações.
