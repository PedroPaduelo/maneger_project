# ✅ CHECKLIST DE TESTE - Sistema SSH

## 📋 Marque cada item conforme completa

---

## 🔧 CONFIGURAÇÃO INICIAL

### [ ] 1. Gerar senha secreta

```bash
openssl rand -base64 32
```

**Resultado:** (copie a senha que apareceu)
```
_________________________________
```

### [ ] 2. Adicionar senha ao .env.local

**Abra o arquivo `.env.local` e adicione:**

```bash
SSH_ENCRYPTION_KEY="cole_sua_senha_aqui"
```

**OU use o comando:**

```bash
echo 'SSH_ENCRYPTION_KEY="sua_senha_aqui"' >> .env.local
```

### [ ] 3. Verificar se salvou

```bash
cat .env.local | grep SSH
```

**Deve mostrar:** `SSH_ENCRYPTION_KEY="..."`

---

## 🔄 REINICIAR SISTEMA

### [ ] 4. Parar o Next.js

- Vá no terminal onde está rodando
- Aperte `Ctrl + C`

### [ ] 5. Limpar cache

```bash
rm -rf .next
```

### [ ] 6. Iniciar novamente

```bash
npm run dev
```

**Aguarde aparecer:** `✓ Ready in X.Xs`

---

## 🔑 PREPARAR CHAVE SSH

### [ ] 7. Verificar se tem chave SSH

```bash
ls ~/.ssh/
```

**Se NÃO tiver** `id_rsa` ou `id_ed25519`:

### [ ] 8. Criar chave SSH (só se não tiver)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/teste_executor -N ""
```

### [ ] 9. Ver chave privada (copiar)

```bash
cat ~/.ssh/teste_executor
```

**Ou se já tinha chave:**

```bash
cat ~/.ssh/id_ed25519
```

**Copie TODO o conteúdo** (de `-----BEGIN` até `-----END`)

### [ ] 10. Instalar chave no servidor local (para teste)

```bash
cat ~/.ssh/teste_executor.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 💻 USAR INTERFACE WEB

### [ ] 11. Abrir navegador

```
http://localhost:3000
```

### [ ] 12. Fazer login

- Email: _______________
- Senha: _______________

### [ ] 13. Ir para Configurações

**Jeito 1:** Clicar no Avatar → "Configurações"

**Jeito 2:** Acessar `http://localhost:3000/settings`

### [ ] 14. Abrir tab "Chaves SSH"

Deve aparecer: "Nenhuma chave SSH cadastrada"

---

## 🔐 ADICIONAR CHAVE SSH

### [ ] 15. Clicar "Adicionar Chave"

### [ ] 16. Preencher formulário:

**Nome:**
```
Teste Local
```

**Host:**
```
127.0.0.1
```

**Porta:**
```
22
```

**Username:** (seu usuário Linux)
```bash
# Descubra com:
whoami
```
Resultado: _______________

**Chave Privada:**
```
Cole aqui a chave que você copiou no passo 9
```

**Marcar como padrão:** ✅ SIM

### [ ] 17. Testar Conexão

- Clicar em "🧪 Testar Conexão SSH"
- Aguardar resultado

**Resultado esperado:**
- ✅ "SSH connection successful" → Continue!
- ❌ "Failed" → Veja seção de problemas abaixo

### [ ] 18. Salvar Chave

- Clicar em "Salvar Chave"
- Aguardar toast: "Chave SSH adicionada com sucesso"

---

## ▶️ TESTAR EXECUÇÃO

### [ ] 19. Ir para um projeto

```
http://localhost:3000/project/1
```

(substitua `1` pelo ID do seu projeto)

### [ ] 20. Abrir Task Executor

- Clicar no botão "▶ Task Executor"
- OU acessar: `http://localhost:3000/project/1/executor`

### [ ] 21. Verificar tasks

- Deve aparecer lista de tasks
- Se vazia, clique "➕ Adicionar Task"

### [ ] 22. Executar tasks

- Selecionar tasks (checkbox)
- Clicar "▶ Executar"

### [ ] 23. Ver logs

**No painel "Log de Execução", deve aparecer:**

```
✅ Execution started with X tasks by seu@email.com
✅ Using SSH key: clq...
✅ Starting task: ...
```

---

## 🎉 SUCESSO!

### [ ] 24. Confirmar funcionamento

- [ ] Logs aparecem em tempo real
- [ ] Mostra seu email nos logs
- [ ] Mostra ID da chave SSH
- [ ] Tasks executam

**Se marcou tudo ✅ = SISTEMA FUNCIONANDO!** 🚀

---

## ❌ PROBLEMAS COMUNS

### ⚠️ Erro: "sSHKey is undefined"

**Solução:**
```bash
# Parar Next.js (Ctrl+C)
rm -rf .next
npm run dev
```

### ⚠️ Erro: "SSH connection timeout"

**Solução:**
```bash
# Instalar SSH server
sudo apt-get install openssh-server
sudo systemctl start ssh
```

### ⚠️ Erro: "Permission denied"

**Solução:**
```bash
# Adicionar chave pública
cat ~/.ssh/teste_executor.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### ⚠️ Erro: "Invalid private key"

**Solução:**
- Copie a chave novamente (passo 9)
- Certifique-se de copiar TUDO
- De `-----BEGIN` até `-----END`

### ⚠️ Erro: "SSH_ENCRYPTION_KEY must be 32 characters"

**Solução:**
- Volte ao passo 1
- Gere nova senha
- Deve ter 32+ caracteres
- Reinicie Next.js

---

## 📊 PROGRESSO

**Marque seu progresso:**

- [ ] Configuração (passos 1-6)
- [ ] Chave SSH (passos 7-10)
- [ ] Interface Web (passos 11-14)
- [ ] Adicionar Chave (passos 15-18)
- [ ] Testar Execução (passos 19-23)
- [ ] ✅ SUCESSO! (passo 24)

**Quantos % você completou?** _____

---

## 🆘 AJUDA RÁPIDA

### Comandos úteis:

**Ver senha configurada:**
```bash
cat .env.local | grep SSH
```

**Verificar banco de dados:**
```bash
npx prisma studio
```
→ Verificar se tabela `tbl_ssh_keys` existe

**Ver logs do Next.js:**
→ Terminal onde roda `npm run dev`

**Meu usuário Linux:**
```bash
whoami
```

**Testar SSH manualmente:**
```bash
ssh seu_usuario@127.0.0.1
```

---

## 📝 NOTAS

Use este espaço para anotar:

**Minha senha SSH_ENCRYPTION_KEY:**
```
(guarde em local seguro!)
```

**Meu username:**
```
_______________
```

**Host que usei:**
```
_______________
```

**Problemas que tive:**
```
_______________
_______________
```

**Soluções que funcionaram:**
```
_______________
_______________
```

---

**Última atualização:** 2025-10-02
**Tempo estimado:** 10-15 minutos
**Nível:** Iniciante ✅

Boa sorte! 🍀
