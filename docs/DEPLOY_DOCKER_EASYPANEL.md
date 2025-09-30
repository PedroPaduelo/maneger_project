# Deploy com Docker e Easy Panel

## 🚀 Deploy Simplificado com Easy Panel

Este guia mostra como fazer o deploy da sua aplicação no Easy Panel usando Docker.

### 📋 Pré-requisitos

- Easy Panel instalado no seu servidor
- Acesso ao painel de administração
- Seu código fonte no repositório Git

### 🔧 Configuração no Easy Panel

#### 1. Criar uma Nova Aplicação

1. Acesse seu Easy Panel
2. Clique em "Applications" → "Create Application"
3. Selecione "Docker" como tipo de aplicação
4. Configure conforme abaixo:

#### 2. Configurações do Docker

**Build Configuration:**
- **Dockerfile Path:** `Dockerfile`
- **Context Path:** `.` (ponto)
- **Build Args:** (deixe em branco)

**Container Configuration:**
- **Container Name:** `nextjs-project-manager`
- **Image Name:** (deixe o padrão)
- **Port:** `3000`
- **Environment Variables:** (veja abaixo)

#### 3. Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente:

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATABASE_URL=postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable
NEXTAUTH_URL=http://seu-dominio.com
NEXTAUTH_SECRET=sua-chave-secreta-aqui
SOCKET_IO_CORS_ORIGIN=http://seu-dominio.com
```

**Importante:** Troque `http://seu-dominio.com` pelo seu domínio real e gere uma chave secreta forte para `NEXTAUTH_SECRET`.

#### 4. Volumes (Opcional)

Para persistência de logs (o banco de dados é remoto, não precisa de volume local):

```bash
# Para logs da aplicação
/app/logs
```

#### 5. Network

- **Network:** `bridge` (padrão)
- **Port Mapping:** `3000:3000`

#### 6. Health Check (Opcional)

```bash
# Health Check
Path: /api/health
Interval: 30
Timeout: 10
Retries: 3
```

### 🚀 Deploy

1. **Conectar ao Repositório Git:**
   - Selecione "Git" como fonte
   - Informe a URL do seu repositório
   - Configure a branch (geralmente `main` ou `master`)

2. **Build e Deploy:**
   - Clique em "Build & Deploy"
   - Aguarde o build completar
   - A aplicação será iniciada automaticamente

### 📊 Monitoramento

#### Verificar Status
- No Easy Panel, veja o status do container
- Verifique os logs em tempo real
- Monitore o uso de recursos (CPU, memória)

#### Logs
- Acesse os logs diretamente no Easy Panel
- Os logs serão salvos no volume `/app/logs`

### 🔄 Atualizações

#### Atualização Automática
1. Faça push das alterações para o repositório Git
2. No Easy Panel, clique em "Redeploy"
3. A aplicação será reconstruída e reiniciada

#### Atualização Manual
1. Vá para "Applications"
2. Selecione sua aplicação
3. Clique em "Rebuild"
4. Aguarde o processo completar

### 🔧 Configurações Avançadas

#### Domínio e SSL
1. Configure seu domínio no Easy Panel
2. Ative o SSL gratuito (Let's Encrypt)
3. Configure o proxy reverso

#### Variáveis de Ambiente Adicionais

```bash
# Para produção
NEXTAUTH_URL=https://seu-dominio.com
SOCKET_IO_CORS_ORIGIN=https://seu-dominio.com
ALLOWED_ORIGINS=https://seu-dominio.com

# Para desenvolvimento local
NEXTAUTH_URL=http://localhost:3000
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

### 🛠️ Solução de Problemas

#### Container não inicia
1. Verifique os logs no Easy Panel
2. Confira as variáveis de ambiente
3. Verifique se o Dockerfile está correto

#### Erro de banco de dados
1. Verifique a conexão com o banco de dados remoto
2. Confira a variável `DATABASE_URL`
3. Verifique se o servidor PostgreSQL está acessível

#### Erro de Socket.IO
1. Verifique a variável `SOCKET_IO_CORS_ORIGIN`
2. Confira se o proxy reverso está configurado corretamente
3. Verifique se as portas estão mapeadas corretamente

#### Build falha
1. Verifique o Dockerfile
2. Confira se todas as dependências estão no package.json
3. Verifique o build log no Easy Panel

### 📁 Estrutura do Projeto

```
seu-projeto/
├── Dockerfile              # Configuração do Docker
├── .dockerignore          # Arquivos ignorados no build
├── .env.docker            # Variáveis de ambiente para Docker
├── package.json           # Dependências e scripts
├── next.config.ts         # Configuração do Next.js
├── prisma/                # Schema do banco de dados
├── src/                   # Código fonte
└── docs/                  # Documentação
```

### 🎯 Benefícios

✅ **Simplicidade:** Apenas um Dockerfile para gerenciar  
✅ **Banco de dados remoto:** PostgreSQL profissional com melhor performance  
✅ **Fácil deploy:** Basta configurar no Easy Panel  
✅ **Escalável:** Easy Panel gerencia o escalonamento  
✅ **Monitoramento:** Logs e métricas integradas  
✅ **SSL:** Certificado SSL gratuito automático  

### 🔄 Backup Automático

O Easy Panel pode ser configurado para fazer backup automático:
1. Vá para "Backups"
2. Configure o agendamento
3. Selecione os volumes para backup (apenas logs, pois o banco de dados é remoto)
4. Configure o destino (S3, FTP, etc.)

### 📈 Performance

O Dockerfile está otimizado para:
- Build rápido com cache de layers
- Imagem final pequena
- Execução como usuário não-root
- Conexão com banco de dados PostgreSQL remoto para melhor performance
- Logs externos para monitoramento

---

### 🚀 Pronto para Deploy!

Seu projeto está pronto para ser deployado no Easy Panel com Docker. Basta seguir os passos acima e sua aplicação estará no ar em minutos!