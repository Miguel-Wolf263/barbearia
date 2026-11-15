# Navalha Real – Sistema de Gestão e Agendamento para Barbearia

Simulado SAEP · Técnico em Desenvolvimento de Sistemas · Atividade individual / prática

Sistema web em **Node.js + Express + MySQL** para cadastro de clientes, barbeiros e serviços e agendamento de horários, com login com expiração de sessão e proteção de dados sensíveis (LGPD).

> Esta versão é a migração do projeto original em PHP. O **banco de dados é o mesmo** (`saep_db.sql` não mudou), assim como telas, regras de negócio e CSS.

## 1. Como executar

Requisitos: **Node.js 20.12+** e **MySQL 5.7+ / MariaDB 10.3+**.

```bash
# 1) Importar o banco
mysql -u root < saep_db.sql          # ou phpMyAdmin → Importar

# 2) Instalar dependências
npm install

# 3) (opcional) configurar ambiente
cp .env.example .env                 # ajuste usuário/senha do MySQL, se necessário

# 4) Subir o servidor
npm start                            # ou: npm run dev (reinicia ao salvar)
```

Acesse **http://localhost:3000**

| Usuário | Senha |
|---|---|
| admin@barbearia.com | admin123 |
| marcos@barbearia.com | marcos123 |
| juliana@barbearia.com | juliana123 |

Testes automatizados (funções e telas, sem precisar de banco): `npm test`

## 2. Requisitos funcionais

| Código | Requisito | Arquivo |
|---|---|---|
| RF01 | Entrar com e-mail e senha, com mensagem clara quando os dados forem inválidos. | `routes/auth.js` |
| RF02 | Encerrar a sessão após 30 min de inatividade e permitir logout manual. | `lib/auth.js`, `routes/auth.js` |
| RF03 | Painel com nome do usuário logado, atalhos e botão Sair. | `routes/painel.js`, `views/layout.js` |
| RF04 | Cadastrar, editar, listar e excluir clientes (nome, CPF, telefone, e-mail). | `routes/clientes.js` |
| RF05 | Buscar clientes por termo; após confirmar, a lista mostra só os correspondentes. | `routes/clientes.js` |
| RF06 | Cadastrar, editar, listar e excluir barbeiros. | `routes/barbeiros.js` |
| RF07 | Cadastrar, editar, listar e excluir serviços, sempre com barbeiro responsável já cadastrado. | `routes/servicos.js` |
| RF08 | Agendar um cliente em um serviço, com dia e horário. | `routes/agendamentos.js` |
| RF09 | Listar agendamentos por dia e horário, com cliente, serviço e barbeiro. | `routes/agendamentos.js` |
| RF10 | Impedir atendimentos sobrepostos para o mesmo barbeiro (considera a duração do serviço). | `routes/agendamentos.js` |
| RF11 | Alterar a situação do agendamento (Agendado, Concluído, Cancelado). | `routes/agendamentos.js` |

## 3. Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF01 | Senhas com hash bcrypt (`bcryptjs`; compatível com os hashes `$2y$` gerados pelo PHP). |
| RNF02 | CPFs criptografados no banco com `AES_ENCRYPT`; nas listagens aparecem mascarados (`***.456.789-**`). |
| RNF03 | Consultas parametrizadas (`?`) com `mysql2` (proteção contra SQL Injection); toda saída HTML é escapada pela função `e()` (proteção contra XSS). |
| RNF04 | Formulários protegidos por token CSRF; ID da sessão regenerado no login. |
| RNF05 | Interface responsiva, com foco visível no teclado e rótulos associados aos campos. |
| RNF06 | Validação de CPF (dígitos verificadores), telefone, e-mail, preço e duração no servidor. |

## 4. Regras de negócio atendidas

- Massa de dados inicial: ao menos 3 registros em todas as tabelas.
- Falha de login mostra mensagem genérica, sem revelar qual campo está errado.
- Serviço só é salvo com um barbeiro existente (`barbeiro_id` NOT NULL + chave estrangeira).
- Chaves estrangeiras com `ON DELETE RESTRICT`: não se exclui cliente, barbeiro ou serviço com vínculos; o sistema avisa o motivo.

## 5. Modelo de dados (DER em `DER_Barbearia.png`)

- **usuarios** (id, nome, email UK, senha)
- **clientes** (id, nome, cpf UK criptografado, telefone, email)
- **barbeiros** (id, nome, cpf UK criptografado, telefone, especialidade)
- **servicos** (id, nome, descricao, preco, duracao_min, *barbeiro_id → barbeiros*)
- **agendamentos** (id, *cliente_id → clientes*, *servico_id → servicos*, data_hora, status, observacao)

## 6. Estrutura do projeto

```
server.js                app Express (sessão, rotas, tratamento de erros)
config.js                variáveis de ambiente (.env)
db.js                    pool de conexões MySQL (mysql2)
saep_db.sql              criação e população do banco (inalterado)
DER_Barbearia.png        diagrama entidade-relacionamento
routes/                  auth, painel, clientes, barbeiros, servicos, agendamentos
views/                   templates HTML (layout, login, painel e telas de cada módulo)
lib/funcoes.js           validações, máscaras, datas, flash e CSRF
lib/auth.js              exigirLogin (expiração de sessão), csrfValidar
lib/render.js            monta a página com layout
public/assets/style.css  estilos
test/                    testes (node:test)
```

### Equivalência PHP → Node

| PHP | Node.js |
|---|---|
| `login.php`, `logout.php`, `index.php` | `/login`, `/logout`, `/` (`routes/auth.js`) |
| `painel.php`, `clientes.php`, … | `/painel`, `/clientes`, `/barbeiros`, `/servicos`, `/agendamentos` |
| `includes/auth.php` | `lib/auth.js` + `express-session` |
| `includes/funcoes.php` | `lib/funcoes.js` |
| `includes/header.php` / `footer.php` | `views/layout.js` |
| `config/config.php` | `config.js` + `.env` |
| PDO + prepared statements | `mysql2` com parâmetros `?` |
| `password_hash` / `password_verify` | `bcryptjs` |

## 7. Observações de segurança

- A `CHAVE_CRIPTO` deve ser a mesma usada no `saep_db.sql`. Em produção, defina-a só por variável de ambiente.
- Defina `SESSION_SECRET` no `.env`. Sem ele, um segredo temporário é gerado a cada inicialização (as sessões se perdem ao reiniciar).
- As sessões ficam em memória (padrão do `express-session`), adequado para estudo/desenvolvimento. Em produção use um *session store* persistente (ex.: `express-mysql-session`).
- Se publicar com HTTPS, use `COOKIE_SECURE=true` (e, atrás de proxy, `app.set('trust proxy', 1)`).
- Troque as senhas de exemplo antes de usar em produção.
