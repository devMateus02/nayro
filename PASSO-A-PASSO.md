# Passo a passo: NAYRO no ar

O que já está pronto e o que falta fazer, em ordem. Itens marcados com ✅ já foram feitos.

---

## 1. Banco de dados (Supabase + Prisma)

- ✅ Projeto criado no Supabase e conexão no `.env` (`DATABASE_URL` e `DIRECT_URL`)
- ✅ Tabelas `projects` e `services` criadas (migrações em `prisma/migrations`)
- ✅ Os 7 serviços do site gravados no banco (4 em destaque na home)
- ✅ Projetos fictícios removidos: o portfólio começa vazio, pronto para os projetos reais

As tabelas ficam protegidas (RLS ligado): ela não aparece na API pública do Supabase. O site lê e grava só pelo servidor, via Prisma.

## 2. Chaves do Supabase (login do painel e imagens)

1. No Supabase, abra **Project Settings → API Keys**.
2. Copie a **Publishable key** (começa com `sb_publishable_`) para `SUPABASE_PUBLISHABLE_KEY` no `.env`.
3. Copie a **Secret key** (começa com `sb_secret_`) para `SUPABASE_SECRET_KEY`.
   - Se a tela só mostrar as chaves antigas, use a `anon` no lugar da publishable e a `service_role` no lugar da secret.
   - A secret key dá acesso total: nunca mande por mensagem nem coloque no código.

Nenhuma dessas chaves vai para o navegador: o login e o envio de imagens acontecem no servidor. As imagens são entregues pelo próprio site, em `/media/...`.

## 3. Usuário do painel

> **Status:** o primeiro admin já foi criado (o seu e-mail, já colocado em `ADMIN_EMAILS`). A senha provisória é fraca: troque em **Authentication → Users → (seu usuário) → Reset password** ou peça para eu trocar. Os passos abaixo servem para adicionar outra pessoa.

1. No Supabase, abra **Authentication → Users → Add user → Create new user**.
2. Informe e-mail e senha e marque **Auto Confirm User**.
3. No `.env`, coloque o mesmo e-mail em `ADMIN_EMAILS`. Para mais de uma pessoa, separe os e-mails por vírgula.
4. Desligue o cadastro aberto: **Authentication → Sign In / Providers → Allow new users to sign up** (desmarcar).
   - Mesmo com o cadastro aberto, só os e-mails de `ADMIN_EMAILS` entram no painel. Desligar é uma camada a mais.

## 4. Testar no computador

```bash
npm run dev
```

Abra http://localhost:3000/admin e entre com o e-mail e a senha do passo 3. Depois de mudar o `.env`, reinicie o `npm run dev`.

### Usando o painel

O painel tem duas abas: **Projetos** e **Serviços**.

**Projetos**


| Ação | Como |
|---|---|
| Cadastrar projeto | **Novo projeto**: nome, resumo, texto, categorias, tags, cliente, ano, link, capa e vídeo |
| Imagens | Envie PNG, JPG ou WebP. O painel reduz para no máximo 2400 px e converte para WebP antes de enviar (máximo de 5 MB por imagem) |
| Capa | Print da tela inicial do site, sem a barra do navegador. Qualquer formato: no notebook da home a capa aparece inteira, com o fundo desfocado preenchendo a sobra |
| Vídeo | Uma gravação de tela de 20 a 60 s (até 3 min), em qualquer formato: o quadro da página do projeto segue o formato do vídeo. As faixas pretas da gravação são cortadas sozinhas (dá para desligar no painel). Envie MP4, MOV ou WebM: o painel converte para WebM (até 1920 px, 30 fps) no próprio navegador e envia. Use o **Chrome** ou o **Edge** e deixe a aba aberta até terminar. O vídeo toca sozinho e sem som no quadro de navegador da página do projeto, com a capa aparecendo enquanto carrega |
| Ordem no site | Setas ↑ ↓ na lista (a ordem da lista é a ordem do site) |
| Destaque na home | Estrela: o projeto entra no carrossel do MacBook na página inicial |
| Ocultar sem apagar | Olho: o projeto continua salvo, mas some do site |
| Excluir | Lixeira e depois **Excluir de vez** (a capa e o vídeo do projeto também são apagados) |

Tudo o que você salva aparece no site na hora. Cada projeto ganha a página `/projetos/<endereço>`.

Sem capa, o projeto aparece com uma tela ilustrativa. Troque pelos prints reais assim que puder: é o que mais valoriza o portfólio.

> **Sobre o tráfego dos vídeos:** o plano gratuito do Supabase inclui 5 GB de tráfego por mês. Um vídeo de 1 minuto convertido fica com uns 15 MB, e cada pessoa que assiste baixa o vídeo inteiro uma vez. Prefira vídeos curtos (20 a 40 s). Se o site crescer, vale passar para o plano pago ou para um serviço de vídeo.

**Serviços**

| Ação | Como |
|---|---|
| Cadastrar serviço | **Novo serviço**: nome, resumo (cartão da página de serviços), texto do destaque (home) e ícone |
| Destaque na home | Estrela: o serviço entra na seção "O que nós oferecemos" da página inicial (ideal: de 3 a 5) |
| Serviço normal | Sem estrela: aparece só na página /servicos |
| Ordem, ocultar, excluir | Igual aos projetos |

Na home, o nome do serviço é quebrado em duas linhas: a última palavra vai para baixo, em roxo (ex.: "Desenvolvimento" / "Web"). O formulário mostra uma prévia.

Sem nenhum projeto publicado, a seção de projetos da home some e a página /projetos mostra "Novos projetos em breve". Sem nenhum serviço em destaque, a seção de serviços da home também some.

## 5. Formulário de contato

O formulário não envia e-mail: ele monta a mensagem e abre o WhatsApp da pessoa já com o texto pronto para o número da NAYRO. Não precisa configurar nada.

## 6. Conteúdo que só vocês podem passar

- [ ] Cadastrar os projetos reais, com prints (pelo painel)
- [ ] Revisar os textos dos serviços (pelo painel) e as respostas do FAQ
- [ ] Conferir os números do site ("+10 projetos entregues", "100% clientes satisfeitos")
- [ ] Revisar a Política de Privacidade e os Termos de Uso (`/privacidade` e `/termos`) e, se possível, passar por um advogado. Se tiverem CNPJ, vale incluir.

## 7. Publicar (GitHub + Vercel)

1. Suba o código para um repositório **privado** no GitHub. O `.env` não vai junto (está no `.gitignore`), e é assim que deve ser.
2. Em https://vercel.com, clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, cadastre as mesmas variáveis do `.env`:
   `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAILS`, `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` (depois do passo 8).
   - `SITE_URL` deve ser o endereço oficial, ex.: `https://nayro.com.br`.
4. Clique em **Deploy**. O build já gera o cliente do Prisma sozinho.
5. Domínio: **Settings → Domains → Add** e siga as instruções de DNS.
6. Visitas: no projeto da Vercel, abra a aba **Analytics** e clique em **Enable**. A partir daí ela mostra quantas pessoas entram, as páginas mais vistas, de onde vieram e o aparelho. Conta todas as visitas, sem cookies e sem identificar ninguém.

## 8. Google, Bing e buscas por IA

### Google Search Console
1. Abra https://search.google.com/search-console e adicione o site (opção **Prefixo do URL**, ex.: `https://nayro.com.br`).
2. Escolha a verificação por **Tag HTML** e copie só o valor de `content="..."` para `GOOGLE_SITE_VERIFICATION` (no `.env` e na Vercel). Publique de novo e clique em **Verificar**.
3. Em **Sitemaps**, envie `https://nayro.com.br/sitemap.xml`.
4. Em **Inspeção de URL**, peça a indexação da página inicial e de `/projetos`.

### Bing (também alimenta o ChatGPT e o Copilot)
1. Em https://www.bing.com/webmasters, importe o site direto do Search Console (é o caminho mais rápido) ou verifique com a meta tag em `BING_SITE_VERIFICATION`.
2. Envie o mesmo sitemap.

### Perfil da Empresa no Google (recomendado)
Crie em https://business.google.com, com o mesmo nome, telefone e site. É o que faz a NAYRO aparecer no Maps e em buscas como "desenvolvimento de sites perto de mim".

### O que o site já faz sozinho
- Título, descrição, endereço canônico e prévia de link próprios em cada página.
- Dados estruturados (schema.org) da empresa, serviços, perguntas frequentes, projetos e trilha de navegação.
- `sitemap.xml` e `robots.txt` atualizados a cada projeto publicado. O painel fica fora das buscas.
- Robôs de IA liberados no `robots.txt` (ChatGPT, Claude, Perplexity, Gemini e outros).
- `/llms.txt` e `/llms-full.txt`: um resumo do site em texto simples para as IAs, com serviços, projetos, FAQ e contato. Atualizam sozinhos.

Para ajudar ainda mais: mantenha projetos com textos completos e prints reais, e passe os links das redes sociais (entram nos dados estruturados da empresa).

## 9. Cookies e contagem de visitas

O site não grava cookies para quem visita, por isso não tem aviso de cookies. A contagem de visitas (Vercel Analytics) não usa cookies nem identifica ninguém: ela conta todas as visitas. O painel /admin não entra na contagem. A Política de Privacidade já descreve isso.

---

## Comandos úteis

| Comando | Para quê |
|---|---|
| `npm run dev` | Site no computador (http://localhost:3000) |
| `npm run build` | Gera a versão de produção (o mesmo que a Vercel roda) |
| `npm run db:migrate` | Aplica no banco as migrações novas de `prisma/migrations` |
| `npm run db:seed` | Grava os serviços iniciais (só se a tabela de serviços estiver vazia) |
| `npm run db:studio` | Abre o Prisma Studio para ver e editar o banco direto |

Para mudar a estrutura do banco: edite `prisma/schema.prisma` e rode `npx prisma migrate dev --name descricao-da-mudanca` (cria a migração e já aplica no banco). A Vercel não roda migrações sozinha: aplique antes de publicar.
