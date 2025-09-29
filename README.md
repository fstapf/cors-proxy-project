# 🚀 CORS Proxy para GitHub Pages

Este projeto resolve problemas de CORS ao fazer requisições para APIs externas a partir de uma página estática hospedada no GitHub Pages, usando um Cloudflare Worker como proxy.

## 🌟 Características

- ✅ **Proxy CORS completo** com Cloudflare Workers
- ✅ **Deploy automático** via GitHub Actions
- ✅ **Suporte a todos os métodos HTTP** (GET, POST, PUT, DELETE, etc.)
- ✅ **Configuração de token de API** via secrets
- ✅ **Interface de teste** incluída
- ✅ **Ambientes de desenvolvimento e produção**

## 🏗️ Arquitetura

```
GitHub Pages (index.html)
    ↓ fetch(/api/*)
Cloudflare Worker (CORS Proxy)
    ↓ proxy para
API Externa (https://dev.ipes.tech)
```

## 🚀 Setup Inicial

### 1. Configurar Secrets no GitHub

Vá para Settings → Secrets and variables → Actions e adicione:

- `CLOUDFLARE_API_TOKEN`: Token da API do Cloudflare
- `CLOUDFLARE_ACCOUNT_ID`: ID da sua conta Cloudflare

#### Como obter as credenciais:

1. **Cloudflare API Token**:
   - Acesse: https://dash.cloudflare.com/profile/api-tokens
   - Clique em "Create Token"
   - Use o template "Edit Cloudflare Workers"
   - Ou crie um custom token com permissões:
     - Zone:Zone Settings:Read
     - Zone:Zone:Read
     - Account:Cloudflare Workers:Edit

2. **Account ID**:
   - No dashboard do Cloudflare, lado direito da tela
   - Seção "API" → Account ID

### 2. Habilitar GitHub Pages

1. Vá para Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main` / `/ (root)`
4. Save

### 3. Deploy automático

O deploy é automático a cada push na branch `main`. Verifique o progresso na aba Actions.

## ⚙️ Configuração da API

### Configurar URL do Cloudflare Worker

**IMPORTANTE**: Após o primeiro deploy, você precisa configurar a URL correta do worker no `index.html`.

1. **Encontre seu Account ID:**
   - Vá para o Cloudflare Dashboard
   - No lado direito, seção "API" → copie o Account ID

2. **Edite o arquivo `index.html`** (linhas 119-120):
   ```javascript
   // Substitua SUA_CONTA_ID pelo seu Account ID real:
   baseUrl = 'https://cors-proxy.SUA_CONTA_ID.workers.dev';
   ```

3. **Ou use a URL custom domain** (se configurou):
   ```javascript
   baseUrl = 'https://cors-proxy.workers.dev';
   ```

### Trocar a URL da API Externa

Edite o arquivo `worker/index.js`:

```javascript
// Linha 6: Altere para sua API
const API_BASE_URL = 'https://sua-api.com';
```

### Configurar Token de API (opcional)

Se sua API requer autenticação:

```bash
# Configurar token via Wrangler CLI
npx wrangler secret put API_TOKEN

# Ou via GitHub Actions (recomendado)
# Adicione API_TOKEN nos secrets do GitHub
```

## 🧪 Testando

### Localmente

```bash
# Instalar dependências
npm install

# Rodar worker em desenvolvimento
npm run dev

# Abrir index.html no navegador
# O JavaScript detectará automaticamente o ambiente local
```

### Em produção

1. Acesse sua página do GitHub Pages: `https://seu-usuario.github.io/cors-proxy-project`
2. Clique nos botões de teste
3. Verifique o console do navegador para logs detalhados

## 📡 Endpoints

O worker intercepta requisições para `/api/*` e as redireciona para a API externa:

- `GET /api/test` → `GET https://dev.ipes.tech/test`
- `POST /api/users` → `POST https://dev.ipes.tech/users`
- etc.

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento local
npm run deploy       # Deploy para produção
npm run deploy:dev   # Deploy para desenvolvimento
npm run tail         # Ver logs em tempo real
```

## 🐛 Troubleshooting

### Worker não está funcionando
- Verifique os secrets no GitHub
- Confirme se o deploy foi executado com sucesso na aba Actions
- Verifique logs no Cloudflare Dashboard → Workers & Pages

### CORS ainda não funciona
- Confirme se a requisição está indo para `/api/*`
- Verifique se o worker está recebendo a requisição
- Use `npm run tail` para ver logs em tempo real

### GitHub Pages não carrega
- Confirme se o GitHub Pages está habilitado
- Aguarde alguns minutos após o primeiro deploy
- Verifique se o arquivo index.html está na raiz

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.