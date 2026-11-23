# Entrelinhas

O Entrelinhas é um diário de humor desenvolvido para o Trabalho Final de Desenvolvimento de Aplicações para Dispositivos Móveis. O app permite registrar humores, acompanhar o histórico no calendário, exportar um relatório em PDF e conversar com uma IA que consulta materiais de referência.

## Escolha como testar

| Forma de execução | Use quando quiser |
| --- | --- |
| [Instalar o APK](#1-instalar-o-apk-no-android) | Testar a versão publicada em um celular Android |
| [Abrir pelo Expo com as APIs publicadas](#2-abrir-pelo-expo-com-as-apis-publicadas) | Executar o projeto baixado usando os serviços da equipe |
| [Executar as APIs localmente](#3-executar-o-app-e-as-apis-localmente) | Reproduzir o ambiente e iniciar os serviços no próprio computador |

Os comandos de instalação e inicialização estão na **seção 4 do arquivo Entrelinhas_Documentacao.docx**, que acompanha a entrega.

## 1. Instalar o APK no Android

1. Abra a [página de releases do Entrelinhas](https://github.com/joycemoura/App-Entrelinhas/releases) no navegador do celular.
2. Abra a versão publicada e procure a seção **Assets**, no fim da página da versão.
3. Toque no arquivo que termina em **.apk** e aguarde o download.
4. Abra o arquivo em **Downloads** e toque em **Instalar**. Se o Android pedir permissão para instalar pela origem usada no download, siga o aviso do sistema.
5. Abra o **Entrelinhas** no menu de aplicativos. Crie uma conta fictícia, aceite os termos quando aparecerem e faça login.
6. Siga o [roteiro de teste](#roteiro-de-teste) para conferir as funcionalidades.

O APK já está configurado para usar as APIs publicadas pela equipe. Mantenha o celular conectado à internet durante o teste.

## 2. Abrir pelo Expo com as APIs publicadas

### Baixar e abrir o projeto

1. Instale o **Node.js 22 ou 24** no computador. Para testar no Android, instale também o **Expo Go** no celular.
2. Abra o [repositório do Entrelinhas](https://github.com/joycemoura/App-Entrelinhas). Clone o projeto com Git ou use **Code → Download ZIP** e extraia o conteúdo.
3. Abra o projeto no VS Code. A pasta correta é aquela que contém **api**, **api-ia** e **mobile**.

### Configurar os serviços publicados

1. Dentro de **mobile**, abra ou crie o arquivo **.env**.
2. Nesse arquivo, preencha a configuração **EXPO_PUBLIC_API_URL** com o endereço da **API de dados** da tabela abaixo.
3. Abra **mobile/src/services/iagen.js** e confira se o endereço publicado é o da **API de IA** da tabela.

| Serviço | Endereço para configurar | Página de verificação |
| --- | --- | --- |
| API de dados | [https://app-entrelinhas.vercel.app](https://app-entrelinhas.vercel.app) | [Verificar API de dados](https://app-entrelinhas.vercel.app/health) |
| API de IA | [https://api-ia-ten.vercel.app](https://api-ia-ten.vercel.app) | [Verificar API de IA](https://api-ia-ten.vercel.app/saude) |

### Abrir o aplicativo

1. Siga a **seção 4.2 da documentação técnica** para instalar as dependências da pasta **mobile** e iniciar o Expo.
2. Para testar no **Android**, conecte o celular e o computador à mesma rede Wi-Fi. Abra o Expo Go e escaneie o QR Code exibido pelo Expo.
3. Para testar no **computador**, pressione **W** na tela em que o Expo está rodando. O app abrirá no navegador.
4. Quando aparecer a tela inicial do Entrelinhas, siga o [roteiro de teste](#roteiro-de-teste). Se o app apresentar erro de conexão, abra as páginas de verificação da tabela e confira os endereços configurados. Reinicie o Expo depois de alterar o arquivo **.env**.

Nesse modo, o app usa o banco de dados e a base de PDFs já preparados pela equipe.

## 3. Executar o app e as APIs localmente

### Colocar os arquivos de configuração no lugar

1. Abra a pasta do repositório baixado.
2. Extraia o **ZIP privado entregue na UFPR Virtual**.
3. Copie cada arquivo para o destino abaixo. As três pastas têm um arquivo com o mesmo nome, **.env**.

| Arquivo no ZIP | Onde colocar no projeto | O que configura |
| --- | --- | --- |
| **api/.env** | Pasta **api** | Conexão com o PostgreSQL e autenticação |
| **api-ia/.env** | Pasta **api-ia** | Chave do Gemini e identificação da base de PDFs |
| **mobile/.env** | Pasta **mobile** | Endereço da API de dados utilizada pelo aplicativo |

Mantenha as credenciais no ZIP privado e nos arquivos de configuração locais.

### Preparar o banco e iniciar a API de dados

1. Abra **api/.env**. Se o arquivo aponta para um banco de avaliação já preparado, mantenha a configuração recebida.
2. Se for usar um **PostgreSQL local vazio**, inicie o PostgreSQL, crie o banco **App-Entrelinhas** e coloque no arquivo **api/.env** o nome do banco, o usuário e a senha da sua instalação. A **seção 4.3 da documentação técnica** mostra como criar as tabelas.
3. Instale as dependências da pasta **api** e inicie a API de dados conforme a **seção 4.3**.
4. Abra a [página de verificação da API de dados local](http://localhost:3000/health). A página deve retornar uma resposta antes de você seguir para a próxima etapa.

### Iniciar a API de IA

1. Confira se o arquivo **api-ia/.env** está na pasta certa e contém a chave do Gemini e o identificador da base de PDFs.
2. Instale as dependências da pasta **api-ia** e inicie o serviço conforme a **seção 4.4 da documentação técnica**.
3. Abra a [página de verificação da API de IA local](http://localhost:3001/saude). Confira se **chaveConfigurada** e **baseConfigurada** aparecem como **true**.
4. Se o ZIP aponta para a base já indexada, pode seguir para a abertura do app. Se estiver usando uma base nova, siga a etapa de importação dos PDFs na **seção 4.4**.

### Conectar o aplicativo às APIs locais

1. Em **mobile/.env**, configure **EXPO_PUBLIC_API_URL** conforme o dispositivo de teste.

   | Onde o app vai abrir | Endereço da API de dados |
   | --- | --- |
   | Navegador no computador que executa as APIs | **http://localhost:3000** |
   | Celular Android conectado à mesma rede | Endereço **IPv4 do computador**, por HTTP, na porta **3000** |

2. Em **mobile/src/services/iagen.js**, deixe o campo **enderecoPublicado** vazio. O app usará a API de IA no mesmo computador da API de dados, pela porta **3001**.
3. Inicie o Expo na pasta **mobile** conforme a **seção 4.5**. Se o Expo já estava aberto antes das alterações, reinicie-o.
4. Pressione **W** para abrir no navegador ou escaneie o QR Code no Expo Go. Para testar no celular, mantenha-o na mesma rede Wi-Fi do computador.

## Roteiro de teste

1. **Cadastro e login.** Crie uma conta fictícia, aceite os termos quando aparecerem e faça login.
2. **Diário.** Registre um humor, abra o calendário e localize o registro. Edite-o e confira se a alteração foi salva.
3. **Conversa com IA.** Pergunte “Segundo o Guia Alimentar, por que priorizar alimentos in natura ou minimamente processados?” e confira se a resposta indica a fonte.
4. **Relatório.** Abra a área de privacidade e dados, exporte o relatório em PDF e confira se ele contém os dados da conta de teste.
