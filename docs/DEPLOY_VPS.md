# Deploy em VPS (Virtual Private Server)

Este guia explica como fazer o deploy da aplicação em uma VPS usando PM2 para gerenciamento de processos.

## Pré-requisitos

### No Servidor VPS
- Ubuntu 20.04+ ou similar
- Node.js 18+ (recomendado usar NVM)
- npm ou yarn
- PM2 instalado globalmente
- PostgreSQL (para produção)
- Git (para clonar o repositório)

### Instalação das Dependências

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js usando NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Instalar PM2 globalmente
npm install -g pm2

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar Git
sudo apt install git -y
```

## Configuração do Banco de Dados

### PostgreSQL
```bash
# Acessar o PostgreSQL
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE nome_do_banco;

# Criar usuário
CREATE USER usuario_com_senha WITH PASSWORD 'senha_forte';

# Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE nome_do_banco TO usuario_com_senha;

# Sair do PostgreSQL
\q
```

## Processo de Deploy

### 1. Clonar o Repositório
```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar o arquivo de ambiente de produção
cp .env.production .env

# Editar o arquivo .env com suas configurações reais
nano .env
```

### 3. Instalar Dependências e Build
```bash
# Instalar dependências
npm install

# Gerar Prisma client
npm run db:generate

# Rodar migrações do banco de dados
npm run db:migrate

# Build da aplicação
npm run build
```

### 4. Iniciar a Aplicação com PM2
```bash
# Iniciar a aplicação
pm2 start ecosystem.config.js --env production

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup
```

### 5. Configurar Nginx (Opcional, mas recomendado)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/seu-dominio.com
```

Configuração do Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuração para Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar o site
sudo ln -s /etc/nginx/sites-available/seu-dominio.com /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 6. Configurar SSL com Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

## Scripts Úteis

### Deploy Automatizado
Use o script `deploy-simple.sh` para um deploy rápido:
```bash
./deploy-simple.sh
```

### Comandos PM2 Úteis
```bash
# Ver status das aplicações
pm2 status

# Ver logs em tempo real
pm2 logs

# Reiniciar aplicação
pm2 restart nextjs-project-manager

# Parar aplicação
pm2 stop nextjs-project-manager

# Deletar aplicação
pm2 delete nextjs-project-manager

# Monitorar aplicação
pm2 monit

# Recarregar aplicação (zero downtime)
pm2 reload nextjs-project-manager
```

### Comandos de Banco de Dados
```bash
# Gerar migrations
npx prisma migrate dev

# Push do schema (para desenvolvimento)
npx prisma db push

# Acessar o Prisma Studio
npx prisma studio

# Resetar banco de dados
npx prisma migrate reset
```

## Monitoramento e Manutenção

### Logs
```bash
# Ver logs da aplicação
pm2 logs nextjs-project-manager

# Ver logs específicos
pm2 logs nextjs-project-manager --lines 100

# Ver logs de erro
pm2 logs nextjs-project-manager --err
```

### Monitoramento de Recursos
```bash
# Monitorar uso de memória e CPU
pm2 monit

# Ver informações detalhadas
pm2 describe nextjs-project-manager
```

### Backup
```bash
# Backup do banco de dados PostgreSQL
pg_dump nome_do_banco > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup dos arquivos da aplicação
tar -czf backup_app_$(date +%Y%m%d_%H%M%S).tar.gz .
```

## Solução de Problemas

### Problemas Comuns

1. **Aplicação não inicia**
   ```bash
   # Ver logs de erro
   pm2 logs nextjs-project-manager --err
   
   # Verificar se a porta está em uso
   sudo netstat -tulpn | grep :3000
   
   # Verificar variáveis de ambiente
   pm2 env nextjs-project-manager
   ```

2. **Problemas com banco de dados**
   ```bash
   # Testar conexão com o banco
   npx prisma db pull
   
   # Verificar status do PostgreSQL
   sudo systemctl status postgresql
   
   # Reiniciar PostgreSQL
   sudo systemctl restart postgresql
   ```

3. **Problemas com Socket.IO**
   ```bash
   # Verificar se o WebSocket está funcionando
   curl -I http://localhost:3000/api/socketio
   
   # Verificar logs do Nginx (se estiver usando)
   sudo tail -f /var/log/nginx/error.log
   ```

### Atualização da Aplicação

```bash
# 1. Fazer pull das últimas alterações
git pull origin main

# 2. Instalar dependências atualizadas
npm install

# 3. Gerar Prisma client
npm run db:generate

# 4. Rodar migrations se necessário
npx prisma migrate deploy

# 5. Build da aplicação
npm run build

# 6. Recarregar aplicação com PM2
pm2 reload nextjs-project-manager
```

## Segurança

### Configurações de Segurança Recomendadas

1. **Firewall**
   ```bash
   # Configurar UFW (Uncomplicated Firewall)
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Atualizações do Sistema**
   ```bash
   # Atualizar sistema regularmente
   sudo apt update && sudo apt upgrade -y
   
   # Configurar atualizações automáticas de segurança
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Backup Automático**
   ```bash
   # Criar script de backup
   nano backup.sh
   
   # Tornar executável
   chmod +x backup.sh
   
   # Adicionar ao crontab
   crontab -e
   # Adicionar: 0 2 * * * /caminho/para/backup.sh
   ```

Este guia cobre o processo completo de deploy em VPS. Para dúvidas adicionais, consulte a documentação oficial do PM2, Next.js e PostgreSQL.