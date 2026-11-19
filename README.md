# Entrelinhas

Entrelinhas é um aplicativo de diário de humor desenvolvido para o Trabalho Final de Desenvolvimento de Aplicações para Dispositivos Móveis da UFPR, Setor Palotina. Permite registrar humores, consultar e editar entradas, comparar frequências no mês, refletir sobre o diário e exportar os dados da conta em PDF. A conversa usa dois guias públicos para responder dúvidas sobre o aplicativo e sugerir perguntas gerais de reflexão.

A [documentação do aplicativo](ENTRELINHAS_DOCUMENTACAO.md) reúne os onze itens do trabalho, incluindo a arquitetura, as decisões de projeto, as recomendações TrackWell, os detalhes de configuração e a geração do APK.

## Estrutura

| Pasta | Responsabilidade |
| --- | --- |
| `api/` | API Express com cadastro, login, perfil, CRUD de registros e acesso ao PostgreSQL. |
| `mobile/` | Aplicativo React Native com Expo. |
| `api-ia/` | API Express na Vercel, comunicação com Gemini e documentos públicos do chat. |

## Como executar em desenvolvimento

Use Git, Node.js 22 atualizado ou 24, PostgreSQL e Expo Go. Os comandos abaixo são para PowerShell. Substitua `URL_DO_REPOSITORIO` pelo endereço público informado na entrega.

```powershell
git clone "URL_DO_REPOSITORIO" App-Entrelinhas
cd App-Entrelinhas
```

Os arquivos de configuração da entrega privada vão em `api/.env`, `mobile/.env` e `api-ia/.env`, conforme a seção 4 da documentação. O arquivo da IA é utilizado para executar esse serviço localmente.

### API e banco de dados

Com o PostgreSQL em execução, crie ou selecione o banco. O nome usado em desenvolvimento é `App-Entrelinhas`. Em `api/.env`, preencha o usuário, a senha do banco e o segredo JWT conforme sua configuração ou o arquivo privado entregue. O segredo é uma sequência aleatória de 64 caracteres hexadecimais. Em um ambiente novo, gere-o com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

```dotenv
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=App-Entrelinhas
PGUSER=postgres
PGPASSWORD=
JWT_SECRET=
```

Em um terminal na raiz do projeto, execute os comandos abaixo.

```powershell
cd api
npm.cmd install
npm.cmd run db:init
node --watch src/server.js
```

O script de inicialização aplica `api/database/schema.sql`. Se o script npm estiver ausente, execute `node src/database/inicializar.js` no lugar de `npm.cmd run db:init`. A rota [http://localhost:3000/health](http://localhost:3000/health) verifica o servidor.

### Aplicativo Expo

No Android físico, conecte o computador e o celular à mesma rede. Em `mobile/.env`, coloque a URL da API de dados, substituindo o IP do exemplo pelo IP do computador. Para navegador no próprio computador, use `http://localhost:3000`.

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Em `mobile/src/services/iagen.js`, use o endereço de produção da IA.

```js
const enderecoPublicado = 'https://api-ia-ten.vercel.app';
```

Abra outro terminal na raiz e execute os comandos abaixo.

```powershell
cd mobile
npm.cmd install
npx.cmd expo start --clear
```

Escaneie o QR Code com Expo Go. Crie uma conta fictícia, aceite os termos, faça login e teste o diário. Para testar a variante web, veja os pré-requisitos de acesso à API na seção 4 do documento.

### API de IA local

O aplicativo pode usar a API pública diretamente. Para executar a API de IA local, coloque o arquivo privado em `api-ia/.env` ou crie-o a partir de `.env.exemplo` e preencha `GEMINI_API_KEY`, mantendo a chave privada. Em um terceiro terminal na raiz, execute os comandos abaixo.

```powershell
cd api-ia
npm.cmd install
if (-not (Test-Path .env)) { Copy-Item .env.exemplo .env }
npm.cmd run dev
```

Ao criar o arquivo de exemplo pelo comando, preencha a chave e reinicie a API antes de testar uma pergunta. A rota local é [http://localhost:3001/saude](http://localhost:3001/saude). Os pedidos de exemplo estão em `api-ia/testes.http`.

## API de IA publicada

[Verificar saúde da API](https://api-ia-ten.vercel.app/saude)

```http
POST https://api-ia-ten.vercel.app/perguntar
Content-Type: application/json

{
  "pergunta": "Como registrar meu humor no Entrelinhas?"
}
```

A API usa **Gemini 3.5 Flash-Lite** para produzir respostas breves com base nos guias em `api-ia/documentos/`. A resposta indica as fontes quando encontra base no material. O assistente atende questões gerais sobre o diário e a reflexão. Diagnóstico, medicamentos, tratamento e análise clínica individual ficam fora do escopo. Em 19/11/2026, a rota de saúde, uma pergunta sobre o diário e outra fora dos guias responderam na API de produção.

## Onde está cada parte

| O que conferir | Arquivo |
| --- | --- |
| Sessão, aceite e saída | `mobile/App.js` |
| Envio do token e mensagens HTTP | `mobile/src/services/api.js` |
| Configuração da URL pública e envio de pergunta | `mobile/src/services/iagen.js` |
| Hash de senha | `api/src/controllers/authController.js` |
| Assinatura e verificação do token | `api/src/config/autenticacao.js` e `api/src/middlewares/autenticar.js` |
| Script do banco e operações do diário | `api/database/schema.sql` e `api/src/controllers/registrosHumorController.js` |
| Formatação e exportação do PDF | `mobile/src/services/relatorio.js` e `mobile/src/screens/HistoricoScreen.js` |
| Instrução de sistema, leitura de documentos e da chave da IA | `api-ia/app.js` |
| Materiais que entram no contexto do modelo | `api-ia/documentos/` |

As instruções de APK estão na seção 5 e as decisões do TrackWell, na seção 8 da [documentação do aplicativo](ENTRELINHAS_DOCUMENTACAO.md).
