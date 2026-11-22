Entrelinhas
Aplicativo de diário de humor desenvolvido como Trabalho Final da disciplina de Desenvolvimento de Aplicações para Dispositivos Móveis da Universidade Federal do Paraná (UFPR) — Setor Palotina.

O Entrelinhas permite registrar e acompanhar o humor, consultar e editar registros, visualizar a frequência dos humores ao longo do mês, refletir sobre as anotações e exportar os dados da conta em PDF. Também oferece uma conversa com inteligência artificial baseada em materiais de referência sobre emoções, sono, autocuidado e rede de apoio, indicando as fontes consultadas nas respostas.

A [documentação completa do aplicativo](ENTRELINHAS_DOCUMENTACAO.md) apresenta os onze itens do trabalho, incluindo arquitetura, decisões de projeto, recomendações do Guia TrackWell, configurações e geração do APK.
Sumário
- Funcionalidades
- Tecnologias e estrutura
- Pré-requisitos
- Instalação e execução
  - 1. Clonar o repositório
  - 2. Configurar a API e o banco de dados
  - 3. Executar o aplicativo com Expo
  - 4. Executar a API de IA localmente (opcional)
- API de IA publicada
- Principais arquivos
- Documentação
Funcionalidades
- Cadastro, login e gerenciamento de sessão.
- Registro, consulta e edição de entradas do diário de humor.
- Visualização da frequência dos humores no mês.
- Espaço para reflexão sobre os registros.
- Exportação dos dados da conta em PDF.
- Conversa com IA sobre temas relacionados ao bem-estar, apoiada em PDFs de referência e com indicação de fontes.
- Tratamento de perguntas fora do escopo da conversa.
Tecnologias e estrutura
Diretório	Tecnologias	Responsabilidade
api/	Node.js, Express e PostgreSQL	Cadastro, autenticação, perfil, operações sobre os registros e acesso ao banco de dados.
mobile/	React Native e Expo	Interface e funcionalidades do aplicativo.
api-ia/	Node.js, Express, Gemini File Search e Vercel	Conversa com IA e consulta aos documentos de referência.


Pré-requisitos
Para executar o projeto em desenvolvimento, é necessário ter:
- Git;
- Node.js 22 atualizado ou Node.js 24;
- PostgreSQL;
- Expo Go instalado no celular Android (para testes em dispositivo físico).
Observação: os comandos desta seção foram preparados para o PowerShell no Windows. Os arquivos .env contêm informações de configuração e não devem expor senhas ou chaves no repositório público.

Instalação e execução
1. Clonar o repositório
No terminal, execute:
git clone https://github.com/joycemoura/App-Entrelinhas.git
cd App-Entrelinhas
O projeto utiliza configurações nos arquivos api/.env, mobile/.env e api-ia/.env. Consulte também a seção 4 da [documentação completa](ENTRELINHAS_DOCUMENTACAO.md).
2. Configurar a API e o banco de dados
Com o PostgreSQL em execução, crie ou selecione um banco de dados. Durante o desenvolvimento, foi utilizado o nome App-Entrelinhas.

Crie o arquivo api/.env e configure os dados de conexão e o segredo de autenticação:
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=App-Entrelinhas
PGUSER=postgres
PGPASSWORD=
JWT_SECRET=
Preencha PGPASSWORD com a senha do PostgreSQL e JWT_SECRET com um segredo aleatório. Para gerar um segredo de 64 caracteres hexadecimais, execute:
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
Em um terminal aberto na raiz do projeto:
cd api
npm.cmd install
npm.cmd run db:init
node --watch src/server.js
O comando de inicialização aplica o arquivo api/database/schema.sql. Se o script db:init não estiver disponível, utilize:
node src/database/inicializar.js
Com a API iniciada, verifique a rota de saúde: http://localhost:3000/health.
3. Executar o aplicativo com Expo
Para testar no celular, conecte o computador e o dispositivo Android à mesma rede.

Crie o arquivo mobile/.env e informe a URL da API. Substitua o endereço IP de exemplo pelo IP local do seu computador:
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
Para acesso pelo navegador no próprio computador, utilize http://localhost:3000.

No arquivo mobile/src/services/iagen.js, mantenha o endereço da API de IA publicada:
const enderecoPublicado = 'https://api-ia-ten.vercel.app';
Abra outro terminal, a partir da raiz do repositório, e execute:
cd mobile
npm.cmd install
npx.cmd expo start --clear
Abra o Expo Go no Android e escaneie o QR Code exibido no terminal. Para validar o funcionamento, crie uma conta de teste, aceite os termos, entre no aplicativo e registre um humor.

Os pré-requisitos de acesso à API para testes na versão web estão descritos na seção 4 da documentação completa.
4. Executar a API de IA localmente (opcional)
O aplicativo já está configurado para utilizar a API de IA publicada. Esta etapa é necessária apenas para executar o serviço localmente ou reproduzir a base de documentos.

Em outro terminal, partindo da raiz do projeto:
cd api-ia
npm.cmd install
Crie o arquivo api-ia/.env e configure as variáveis:
GEMINI_API_KEY=
GEMINI_FILE_SEARCH_STORE=
Para criar uma base de documentos própria, execute:
node --env-file=.env importar-pdf.js --criar-base
Adicione ao .env o identificador da base exibido pelo script. Os arquivos PDF, as instruções de importação e as perguntas de avaliação estão descritos no [README dos materiais](api-ia/documentos/README.md).
Atenção: a cartilha da UFRA deve utilizar o nome ufra-saude-mental-e-bem-estar.pdf.

Inicie a API de IA:
npm.cmd run dev
Verifique http://localhost:3001/saude e confira os campos chaveConfigurada e baseConfigurada.

Para utilizar a API local no aplicativo, altere em mobile/src/services/iagen.js:
const enderecoPublicado = '';
Nesse caso, mantenha o servidor local e o endereço de desenvolvimento acessíveis ao celular.
API de IA publicada
A conversa do Entrelinhas envia as perguntas para a API hospedada na Vercel. O Gemini File Search consulta a base de PDFs configurada para produção, recupera conteúdos relacionados ao tema e apresenta referências documentais nas respostas. Perguntas fora do escopo recebem um aviso.

Links úteis:
- Verificar o estado da API publicada
- [Consultar materiais, importação e perguntas de avaliação](api-ia/documentos/README.md)
Exemplo de requisição
POST https://api-ia-ten.vercel.app/perguntar
Content-Type: application/json

{
  "pergunta": "O que significa higiene do sono?"
}
Principais arquivos
Funcionalidade	Arquivo
Sessão, aceite dos termos e saída	mobile/App.js
Requisições HTTP e envio do token	mobile/src/services/api.js
Configuração e integração com a API de IA	mobile/src/services/iagen.js
Hash de senhas	api/src/controllers/authController.js
Assinatura e verificação de tokens	api/src/config/autenticacao.js e api/src/middlewares/autenticar.js
Estrutura do banco de dados	api/database/schema.sql
Operações do diário de humor	api/src/controllers/registrosHumorController.js
Geração e exportação do PDF	mobile/src/services/relatorio.js e mobile/src/screens/HistoricoScreen.js
Instruções e consulta ao Gemini File Search	api-ia/app.js
Importação e indexação dos documentos	api-ia/importar-pdf.js
Documentos, fontes e testes	api-ia/documentos/README.md


Documentação
Para conhecer as decisões técnicas e pedagógicas do projeto, consulte a [documentação completa do Entrelinhas](ENTRELINHAS_DOCUMENTACAO.md).

Em especial:
- Seção 4: configurações e execução dos serviços.
- Seção 5: geração do APK.
- Seção 8: aplicação das recomendações do Guia TrackWell.
A documentação reúne os onze itens previstos para o trabalho final.
