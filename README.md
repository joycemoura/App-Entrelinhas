# Entrelinhas

O **Entrelinhas** é um aplicativo de registro de humor desenvolvido como trabalho final da disciplina de Desenvolvimento de Aplicações para Dispositivos Móveis da Universidade Federal do Paraná (UFPR).

O aplicativo permite registrar emoções, acompanhar o histórico de humor e consultar materiais informativos sobre saúde mental por meio de uma conversa com inteligência artificial.

## Funcionalidades

- Cadastro e login de usuários.
- Registro diário de humor.
- Edição e exclusão de registros.
- Calendário com histórico de emoções.
- Estatísticas mensais de humor.
- Personalização de avatar, tema e preferências.
- Lembretes e opções de acessibilidade.
- Conversa com IA integrada ao Gemini.
- Consulta a materiais informativos em PDF.
- Exportação dos registros em PDF.
- Gerenciamento e exclusão da conta.

## Tecnologias utilizadas

**Aplicativo**
- React Native
- Expo
- JavaScript
- React Navigation

**Backend**
- Node.js
- Express
- PostgreSQL
- JWT

**Inteligência artificial**
- Google Gemini
- Gemini File Search
- API hospedada na Vercel

## Estrutura do projeto

O projeto está dividido em três pastas principais:

- `mobile/` — aplicativo desenvolvido com React Native e Expo.
- `api/` — backend responsável pela autenticação e armazenamento dos registros no PostgreSQL.
- `api-ia/` — integração com o Gemini e consulta aos documentos de referência.

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/joycemoura/App-Entrelinhas.git
cd App-Entrelinhas
```

### 2. Configurar o backend

Configure o PostgreSQL e as variáveis de ambiente no arquivo `api/.env`.

Depois execute:

```bash
cd api
npm install
npm run db:init
node --watch src/server.js
```

A API será executada na porta `3000`.

### 3. Executar o aplicativo

Configure o endereço da API no arquivo `mobile/.env`.

Em outro terminal, execute:

```bash
cd mobile
npm install
npx expo start
```

Abra o aplicativo utilizando o Expo Go no celular.

### 4. Configurar a inteligência artificial

A integração com IA está localizada na pasta `api-ia/`.

Para executar localmente:

```bash
cd api-ia
npm install
npm run dev
```

É necessário configurar a chave do Gemini e a base de documentos no arquivo `api-ia/.env`.

A API de IA também está publicada na Vercel:

https://api-ia-ten.vercel.app/saude

## Documentos de referência

A inteligência artificial utiliza o Gemini File Search para consultar materiais sobre emoções, sono, autocuidado e saúde mental.

Os documentos estão organizados na pasta `api-ia/documentos/`, juntamente com as instruções de importação e indexação.

## Documentação

A documentação completa do projeto apresenta a arquitetura, as decisões de desenvolvimento, as funcionalidades, os requisitos de segurança e as recomendações do Guia TrackWell utilizadas na construção das interfaces.

Consulte o arquivo `ENTRELINHAS_DOCUMENTACAO.md` para mais detalhes.

## Projeto acadêmico

Desenvolvido para a disciplina de **Desenvolvimento de Aplicações para Dispositivos Móveis**.
