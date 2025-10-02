# 🚀 SSH Quick Start Guide

## Setup em 5 Minutos

### 1️⃣ Gerar Chave SSH

```bash
# Gerar par de chaves
ssh-keygen -t ed25519 -C "executor@myapp.com" -f ~/.ssh/executor_key

# Resultado:
# ✅ ~/.ssh/executor_key (privada)
# ✅ ~/.ssh/executor_key.pub (pública)
```

### 2️⃣ Instalar no Servidor

```bash
# Copiar chave pública
ssh-copy-id -i ~/.ssh/executor_key.pub user@server.com

# Testar conexão
ssh -i ~/.ssh/executor_key user@server.com
```

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# .env.local
SSH_PRIVATE_KEY_PATH=/home/user/.ssh/executor_key
SSH_USERNAME=deploy
SSH_HOST=server.com
SSH_PORT=22
```

### 4️⃣ Instalar Dependências

```bash
npm install ssh2
```

### 5️⃣ Usar no Projeto

```typescript
import { SSHClient } from '@/lib/ssh-client';

// Conectar
const client = new SSHClient({
  host: process.env.SSH_HOST!,
  port: parseInt(process.env.SSH_PORT!),
  username: process.env.SSH_USERNAME!,
  privateKey: fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH!),
});

await client.connect();

// Executar
const result = await client.executeCommand('ls -la');
console.log(result.stdout);

// Desconectar
await client.disconnect();
```

## 🎯 Fluxo de Execução

```
1. Usuário clica em "Executar" na interface web
   ↓
2. Backend recebe requisição
   ↓
3. Backend conecta via SSH ao servidor remoto
   ↓
4. Comandos são executados no servidor
   ↓
5. Logs são enviados em tempo real (WebSocket)
   ↓
6. Resultado é salvo no banco de dados
   ↓
7. Interface mostra status de conclusão
```

## 🔒 Checklist de Segurança

- [ ] ✅ Logs de auditoria habilitados
- [ ] ✅ Rate limiting implementado
- [ ] ✅ Timeout configurado (evitar conexões travadas)

## 🧪 Testar Conexão

### Teste Manual

```bash
# Testar com verbose
ssh -vvv -i ~/.ssh/executor_key user@server.com

# Executar comando remoto
ssh -i ~/.ssh/executor_key user@server.com "ls -la"
```

### Teste na Aplicação

```bash
# Criar script de teste
node test-ssh.js
```

```javascript
// test-ssh.js
const { SSHClient } = require('./src/lib/ssh-client');
const fs = require('fs');

(async () => {
  const client = new SSHClient({
    host: 'server.com',
    port: 22,
    username: 'deploy',
    privateKey: fs.readFileSync('/path/to/key'),
  });

  try {
    console.log('🔌 Conectando...');
    await client.connect();
    console.log('✅ Conectado!');

    console.log('📝 Executando comando...');
    const result = await client.executeCommand('whoami');
    console.log('✅ Resultado:', result.stdout);

    await client.disconnect();
    console.log('👋 Desconectado');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
})();
```

## 📊 Monitoramento

### Logs SSH

```typescript
// Adicionar logging
const client = new SSHClient({
  ...config,
  debug: (msg) => {
    console.log('[SSH DEBUG]', msg);
  },
});
```

### Métricas Importantes

1. **Taxa de Sucesso**: % de execuções bem-sucedidas
2. **Tempo Médio**: Duração média das execuções
3. **Erros Comuns**: Top 5 erros mais frequentes
4. **Uso de Recursos**: CPU/RAM no servidor remoto

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Connection timeout** | Verificar firewall, porta 22 aberta |
| **Authentication failed** | Verificar chave pública no `authorized_keys` |
| **Permission denied** | Verificar permissões (600 para chave) |
| **Command not found** | Verificar PATH no servidor remoto |
| **Connection refused** | Verificar se SSH daemon está rodando |

## 🔄 Alternativas Simples

Se SSH for complexo demais, considere:

### 1. API REST
```typescript
// Servidor expõe API
const result = await fetch('https://server.com/api/execute', {
  method: 'POST',
  body: JSON.stringify({ command: 'ls -la' }),
});
```

### 2. Webhooks
```typescript
// Backend envia webhook
await fetch('https://server.com/webhook/task', {
  method: 'POST',
  body: JSON.stringify({ taskId: 123 }),
});
```

### 3. Message Queue (RabbitMQ, Redis)
```typescript
// Publicar mensagem
await queue.publish('tasks', {
  taskId: 123,
  command: 'npm run build',
});
```

## 📚 Recursos

- [SSH.com - SSH Protocol](https://www.ssh.com/academy/ssh/protocol)
- [ssh2 NPM Package](https://www.npmjs.com/package/ssh2)
- [DigitalOcean SSH Guide](https://www.digitalocean.com/community/tutorials/ssh-essentials-working-with-ssh-servers-clients-and-keys)

## 🎯 Próximos Passos

1. ✅ Setup básico de SSH
2. ⏳ Implementar na API
3. ⏳ Adicionar WebSocket para logs
4. ⏳ Interface web para configuração
5. ⏳ Multi-servidor support

---

**Status**: Documentação Pronta
**Implementação**: Fase 2 (Planejada)
