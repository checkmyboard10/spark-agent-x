# 🤖 AI WhatsApp SaaS - Multi-Agentes White Label

Plataforma SaaS completa para agências gerenciarem múltiplos clientes e agentes de IA no WhatsApp com isolamento multi-tenant, automação de campanhas e integrações poderosas.

## 🎯 Status do Projeto

✅ **Fase 1** - MVP Completo  
✅ **Fase 2** - Automação de Campanhas  
✅ **Fase 3** - Integrações Avançadas  
✅ **Fase 4** - White Label Completo

**Status Atual**: Projeto em produção com todas as funcionalidades principais implementadas!

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação e Segurança
- 🔐 Login/Signup com Lovable Cloud (Supabase)
- 👥 Sistema multi-tenant com isolamento por agência via RLS
- 🛡️ Roles e permissões (Admin, Moderator, User)
- 🔒 Security definer functions para validação de roles
- ✅ Proteção contra senhas vazadas ativada

### ✅ Dashboard e Gestão
- 📊 Dashboard com métricas em tempo real
  - Total de clientes e agentes
  - Conversas ativas
  - Taxa de resposta calculada dinamicamente
- 🏢 CRUD completo de Clientes
- 🤖 CRUD completo de Agentes IA com prompts personalizados
- ⚙️ Configurações completas da agência

### ✅ Campanhas WhatsApp
- 📤 Criação de campanhas com upload de CSV
- 📝 Templates personalizados com variáveis
- 🔄 Follow-ups automáticos (até 3 níveis)
- ⏰ Agendamento de envios
- 📈 Métricas de campanha em tempo real
- 🎯 Worker assíncrono para processamento

### ✅ Integrações
- 📱 WhatsApp Business API (simulação em dev)
- 📅 Google Calendar OAuth para agendamentos
- 🔗 Webhooks com:
  - HMAC signature para segurança
  - Retry policies configuráveis
  - Logs detalhados de execução
  - Teste de webhooks

### ✅ White Label Completo
- 🎨 Personalização visual total:
  - Upload de logo da agência
  - Cores primárias e secundárias customizáveis (HSL)
  - Validação de formato de cores
- 🌐 Configuração de domínios:
  - Subdomínios personalizados (.aiwhatsapp.app)
  - Domínios customizados com instruções DNS
  - Verificação de disponibilidade
- 👥 Gestão de equipe:
  - Convites por email com expiração
  - Remoção de membros com confirmação
  - Gerenciamento de roles
- 🔔 Configurações de notificações
- 💳 Dashboard de billing (básico)
- 🔑 Gerenciamento de API keys

## 🏗️ Arquitetura

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI + Design System HSL
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL com RLS
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno runtime

### Estrutura Multi-Tenant
```
Agencies (White Label)
  ├── Profiles (Users + Roles)
  ├── Settings (Logo, Colors, Domain)
  ├── Invites (Team management)
  └── Clients
       ├── WhatsApp Connection
       ├── Agents (IA)
       ├── Campaigns
       │    ├── Contacts (CSV)
       │    └── Messages (Follow-ups)
       ├── Conversations
       │    └── Messages
       ├── Webhooks
       │    └── Logs
       └── Google Integration
```

### Segurança RLS (Row Level Security)
Todas as tabelas possuem políticas RLS implementadas:
- ✅ `agencies` - SELECT/UPDATE por agência
- ✅ `profiles` - SELECT/UPDATE próprio perfil
- ✅ `user_roles` - SELECT por agência
- ✅ `invites` - INSERT/DELETE apenas admins
- ✅ `clients` - CRUD por agência
- ✅ `agents` - CRUD por agência do cliente
- ✅ `campaigns` - CRUD por agência do cliente
- ✅ `campaign_contacts` - INSERT/SELECT/UPDATE/DELETE por agência
- ✅ `campaign_messages` - INSERT/SELECT/DELETE por agência
- ✅ `conversations` - CRUD por agência
- ✅ `messages` - CRUD por agência
- ✅ `webhooks` - CRUD por agência
- ✅ `webhook_logs` - SELECT por agência
- ✅ `google_integrations` - CRUD por agência

## 🎨 Design System

### Cores (HSL Format)
```css
/* Principais */
--primary: 160 84% 39%        /* Verde Esmeralda */
--secondary: 186 100% 46%      /* Azul Ciano */
--success: 142 76% 36%         /* Verde Sucesso */
--accent: 172 66% 50%          /* Verde Água */

/* Background */
--background: 220 26% 14%      /* Azul Escuro */
--card: 220 24% 18%            /* Card Background */

/* Gradientes */
--gradient-primary: linear-gradient(135deg, primary → primary-glow)
--gradient-secondary: linear-gradient(135deg, secondary → cyan-light)
--gradient-hero: linear-gradient(135deg, primary → secondary)
```

### Componentes
- Cards com hover effects e glow
- Skeleton loaders para loading states
- Empty states com ícones e textos convidativos
- Alerts e Toasts para feedback
- Modal dialogs com múltiplos steps
- Tabs para organização de settings

## 📦 Instalação e Uso

### 1. Clone o Projeto
```bash
git clone <seu-repo>
cd ai-whatsapp-saas
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Ambiente
O projeto está conectado ao Lovable Cloud. As variáveis de ambiente são gerenciadas automaticamente.

### 4. Execute em Desenvolvimento
```bash
npm run dev
```

### 5. Primeiro Acesso
1. Acesse a rota `/auth`
2. Crie sua conta (auto-confirmação ativada)
3. Você será vinculado automaticamente a uma agência demo
4. Um role de `user` será atribuído por padrão
5. Para ter permissões de admin, um admin existente deve convidá-lo

## 🛡️ Segurança Implementada

### Proteções Ativas
- ✅ Row Level Security em todas as tabelas
- ✅ Políticas baseadas em `agency_id` e `user_id`
- ✅ Security definer function para validação de roles
- ✅ Trigger automático para criação de perfis
- ✅ Foreign keys com ON DELETE CASCADE
- ✅ Password strength e leaked password protection
- ✅ Auto-confirmação de email (dev only)
- ✅ Validação de input em formulários
- ✅ HMAC signatures em webhooks
- ✅ Rate limiting em Edge Functions

### Boas Práticas
- ❌ Nunca usar hardcoded credentials
- ❌ Não fazer queries diretas sem RLS
- ✅ Sempre validar inputs
- ✅ Usar prepared statements
- ✅ Sanitizar dados do usuário
- ✅ Logs detalhados para debug

## 📊 Edge Functions

### Functions Implementadas
1. **accept-invite** - Aceita convites de equipe
2. **send-invite** - Envia convites por email
3. **upload-agency-logo** - Upload de logos
4. **update-agency-theme** - Atualiza tema/cores
5. **process-csv** - Processa CSVs de campanha
6. **campaign-worker** - Worker de envio de campanhas
7. **send-whatsapp-message** - Envia mensagens WhatsApp
8. **connect-whatsapp** - Conecta instância WhatsApp
9. **disconnect-whatsapp** - Desconecta WhatsApp
10. **webhook-dispatch** - Dispara webhooks
11. **webhook-test** - Testa configuração de webhook
12. **aggregate-stats** - Agrega estatísticas

### Padrões das Functions
- CORS habilitado
- Autenticação via JWT
- Validação de permissões
- Error handling robusto
- Logs estruturados

## 🎯 Roadmap Futuro

### Melhorias Planejadas
- [ ] Testes unitários e E2E
- [ ] Documentação de API REST completa
- [ ] Analytics avançados com gráficos
- [ ] Exportação de relatórios (PDF/CSV)
- [ ] Integração com mais plataformas (Telegram, Instagram)
- [ ] Chatbot builder visual
- [ ] Templates de campanha pré-definidos
- [ ] Segmentação avançada de audiência
- [ ] A/B testing de mensagens
- [ ] WhatsApp Business API real (produção)

### Extras (Nice to Have)
- [ ] Dark/Light mode toggle
- [ ] Onboarding tour para novos usuários
- [ ] Marketplace de templates
- [ ] Integrações com CRMs
- [ ] Mobile app (React Native)

## 🤝 Contribuindo

Este projeto foi desenvolvido como uma plataforma SaaS completa. Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Proprietário - Desenvolvido com ❤️ usando Lovable

---

**Desenvolvido por**: [Seu Nome/Agência]  
**Powered by**: Lovable + Supabase  
**Versão**: 4.0 (White Label Completo)
