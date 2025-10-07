# 🤖 AI WhatsApp SaaS - Multi-Agentes White Label

Plataforma SaaS completa para agências gerenciarem múltiplos clientes e agentes de IA no WhatsApp com isolamento multi-tenant, automação de campanhas e integrações poderosas.

## 🎯 Características

### ✅ Fase 1 - MVP (Implementado)
- 🔐 **Autenticação Segura** - Login/Signup com Lovable Cloud
- 👥 **Multi-Tenant** - Isolamento total por agência via RLS
- 📊 **Dashboard** - Métricas e visão geral do sistema
- 🏢 **CRUD Clientes** - Gerenciamento completo de clientes
- 🤖 **CRUD Agentes IA** - Configuração de agentes com prompts personalizados
- 🎨 **Design Premium** - Interface dark mode com gradientes e animações
- 📱 **Responsivo** - Mobile-first, funciona perfeitamente em todos dispositivos

### 🚀 Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI + Design System Premium
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL com RLS
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime (preparado)

## 🏗️ Arquitetura Multi-Tenant

```
Agencies (White Label)
  └── Profiles (Users)
  └── Clients
       └── Agents (IA)
            └── Conversations (futuro)
                 └── Messages (futuro)
```

### Segurança RLS
- ✅ Dados isolados por `agency_id`
- ✅ Políticas de segurança granulares
- ✅ Function security definer para roles
- ✅ Trigger automático para criação de perfis

## 🎨 Design System

### Cores Principais
```css
--primary: Verde Esmeralda (160 84% 39%)
--secondary: Azul Ciano (186 100% 46%)
--success: Verde Sucesso (142 76% 36%)
--background: Azul Escuro (220 26% 14%)
```

### Gradientes
- `gradient-primary`: Verde → Verde Claro
- `gradient-secondary`: Ciano → Ciano Claro
- `gradient-hero`: Verde → Ciano
- `gradient-card`: Sombra de card elegante

### Animações
- Hover com glow effect
- Fade-in nos cards
- Transições suaves (0.3s)

## 📦 Como Usar

### 1. Clone e Instale
```bash
git clone <seu-repo>
npm install
```

### 2. Configure o Ambiente
O projeto já está conectado ao Lovable Cloud! As variáveis são gerenciadas automaticamente.

### 3. Execute
```bash
npm run dev
```

### 4. Crie sua Conta
1. Acesse `/auth`
2. Crie uma conta (auto-confirmação ativada)
3. Você será automaticamente vinculado à "Demo Agency"

## 🔮 Próximas Fases

### Fase 2 - Automação
- [ ] Campanhas WhatsApp com CSV upload
- [ ] Follow-ups automáticos (até 3 níveis)
- [ ] Worker para processamento assíncrono
- [ ] Preview de mensagens antes de enviar

### Fase 3 - Integrações
- [ ] Simulador WhatsApp com QR Code
- [ ] Google Calendar OAuth
- [ ] Webhooks entrada/saída com HMAC
- [ ] Roteamento inteligente de mensagens

### Fase 4 - White Label Completo
- [ ] Subdomínios por agência
- [ ] Logos e cores personalizadas
- [ ] Deploy em produção
- [ ] Documentação completa

### Fase Extra - IA Avançada
- [ ] Integração com Lovable AI
- [ ] Humanização de respostas (delays, erros de digitação)
- [ ] Histórico de conversas
- [ ] Análise de sentimentos

## 📊 Schema do Banco

### Tabelas Principais
- `agencies` - Agências (white label base)
- `profiles` - Perfis de usuários
- `user_roles` - Roles (admin/user)
- `clients` - Clientes das agências
- `agents` - Agentes de IA configuráveis

### Próximas Tabelas
- `campaigns` - Campanhas WhatsApp
- `conversations` - Histórico de conversas
- `messages` - Mensagens individuais
- `webhooks` - Integrações externas

## 🛡️ Segurança

- ✅ Row Level Security (RLS) ativo em todas as tabelas
- ✅ Políticas baseadas em `agency_id`
- ✅ Função security definer para check de roles
- ✅ Trigger automático para criação de perfis
- ✅ Foreign keys com CASCADE
- ✅ Auto-confirmação de email (desenvolvimento)

## 🎯 Decisões de Design

1. **Dark Theme First** - Mais moderno e profissional
2. **Gradientes Sutis** - Visual premium sem poluir
3. **Animações Suaves** - UX fluida e agradável
4. **Mobile First** - Sidebar colapsável, breakpoints responsivos
5. **Design System Centralizado** - `index.css` + `tailwind.config.ts`

## 📝 Commits Sugeridos (Histórico)

```
feat(database): setup multi-tenant schema with RLS
feat(auth): implement secure login/signup flow
feat(dashboard): add metrics and overview page
feat(clients): implement full CRUD with modal forms
feat(agents): add agent configuration with prompts
style(design): apply premium dark theme with gradients
docs(readme): add comprehensive project documentation
```

## 🤝 Contribuindo

Este é um projeto inicial (MVP). As próximas fases serão implementadas incrementalmente seguindo a arquitetura proposta.

## 📄 Licença

Proprietário - Desenvolvido com Lovable

---

**Status Atual**: ✅ Fase 1 (MVP) Completa
**Próximo Milestone**: Fase 2 (Campanhas e Automação)
