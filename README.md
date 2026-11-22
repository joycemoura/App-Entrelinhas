Entrelinhas é um aplicativo de diário de humor desenvolvido para o Trabalho Final de Desenvolvimento de Aplicações para Dispositivos Móveis da UFPR, Setor Palotina. Permite registrar humores, consultar e editar entradas, comparar frequências no mês, refletir sobre o diário e exportar os dados da conta em PDF. A conversa consulta PDFs sobre emoções, sono, autocuidado e rede de apoio, com indicação da fonte na resposta.

A documentação do aplicativo reúne os onze itens do trabalho, incluindo a arquitetura, as decisões de projeto, as recomendações TrackWell, os detalhes de configuração e a geração do APK.

Estrutura

Pasta

Responsabilidade

api/

API Express com cadastro, login, perfil, CRUD de registros e acesso ao PostgreSQL.

mobile/

Aplicativo React Native com Expo.

api-ia/

API Express na Vercel, consulta ao Gemini File Search e materiais de referência.

Como executar em desenvolvimento

Use Git, Node.js 22 atualizado ou 24, PostgreSQL e Expo Go. Os comandos abaixo são para PowerShell.

git clone https://github.com/joycemoura/App-Entrelinhas.git
cd App-Entrelinhas

Os arquivos de configuração da entrega privada vão em api/.env, mobile/.env e api-ia/.env, conforme a seção 4 da documentação. O arquivo da IA é utilizado para executar esse serviço localmente.

API e banco de dados

Com o PostgreSQL em execução, crie ou selecione o banco. O nome usado em desenvolvimento é App-Entrelinhas. Em api/.env, preencha o usuário, a senha do banco e o segredo JWT conforme sua configuração ou o arquivo privado entregue. O segredo é uma sequência aleatória de 64 caracteres hexadecimais. Em um ambiente novo, gere-o com node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))".

PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=App-Entrelinhas
PGUSER=postgres
PGPASSWORD=
JWT_SECRET=

Em um terminal na raiz do projeto, execute os comandos abaixo.

cd api
npm.cmd install
npm.cmd run db:init
node --watch src/server.js

O script de inicialização aplica api/database/schema.sql. Se o script npm estiver ausente, execute node src/database/inicializar.js no lugar de npm.cmd run db:init. A rota http://localhost:3000/health verifica o servidor.

Aplicativo Expo

No Android físico, conecte o computador e o celular à mesma rede. Em mobile/.env, coloque a URL da API de dados, substituindo o IP do exemplo pelo IP do computador. Para navegador no próprio computador, use http://localhost:3000.

EXPO_PUBLIC_API_URL=http://192.168.1.10:3000

Em mobile/src/services/iagen.js, use o endereço de produção da IA.

const enderecoPublicado = 'https://api-ia-ten.vercel.app';

Abra outro terminal na raiz e execute os comandos abaixo.

cd mobile
npm.cmd install
npx.cmd expo start --clear

Escaneie o QR Code com Expo Go. Crie uma conta fictícia, aceite os termos, faça login e teste o diário. Para testar a variante web, veja os pré-requisitos de acesso à API na seção 4 do documento.

API de IA local

Para usar a API publicada no app, mantenha a URL do serviço no passo anterior. Para testar a API localmente ou reproduzir a base, abra outro terminal na raiz e execute:

cd api-ia
npm.cmd install

Configure GEMINI_API_KEY e GEMINI_FILE_SEARCH_STORE em api-ia/.env. Para obter uma base própria, rode node --env-file=.env importar-pdf.js --criar-base e acrescente a linha que o script exibir ao .env. Os nomes dos PDFs, os comandos de importação e as perguntas de teste estão no README dos materiais. Use o nome ufra-saude-mental-e-bem-estar.pdf para a cartilha da UFRA.

npm.cmd run dev

Abra a rota de saúde local e confira chaveConfigurada e baseConfigurada. Para avaliar o chat com a API local, use enderecoPublicado = '' em mobile/src/services/iagen.js e mantenha o host de desenvolvimento acessível ao aparelho.

API de IA publicada

O app envia a pergunta à API na Vercel. O Gemini File Search recupera trechos da base de PDFs configurada para a produção. As fontes são exibidas nas respostas com citações documentais, e perguntas fora do escopo recebem um aviso.

Verificar saúde da API publicada

Materiais, importação e perguntas de avaliação

POST https://api-ia-ten.vercel.app/perguntar
Content-Type: application/json

{
  "pergunta": "O que significa higiene do sono?"
}

Onde está cada parte

O que conferir

Arquivo

Sessão, aceite e saída

mobile/App.js

Envio do token e mensagens HTTP

mobile/src/services/api.js

Configuração da URL pública e envio de pergunta

mobile/src/services/iagen.js

Hash de senha

api/src/controllers/authController.js

Assinatura e verificação do token

api/src/config/autenticacao.js e api/src/middlewares/autenticar.js

Script do banco e operações do diário

api/database/schema.sql e api/src/controllers/registrosHumorController.js

Formatação e exportação do PDF

mobile/src/services/relatorio.js e mobile/src/screens/HistoricoScreen.js

Instrução de sistema, consulta ao File Search e leitura da chave da IA

api-ia/app.js

Indexação dos PDFs

api-ia/importar-pdf.js

PDFs, fontes oficiais e testes

api-ia/documentos/README.md

