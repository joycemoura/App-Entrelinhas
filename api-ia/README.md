# API de IA do Entrelinhas

O assistente consulta os guias públicos em `documentos/`. O app chama esta API, e a API envia ao Gemini a pergunta e o conteúdo dos guias. A API devolve a resposta e os títulos das fontes. Uma pergunta que não encontra apoio nos guias recebe um aviso de que a informação não está disponível. O serviço também aceita perguntas gerais sobre como usar o diário para refletir.

## Rodar na máquina

Use Node.js 22 ou 24. Na pasta `api-ia`, execute `npm install`. Crie `.env` com base em `.env.exemplo` e coloque a chave obtida no Google AI Studio em `GEMINI_API_KEY`. Inicie com `npm run dev`. Abra `http://localhost:3001/saude` e use `testes.http` para testar o endpoint de perguntas.

## Publicação e exemplo

A publicação na Vercel fica na pasta `api-ia`. Configure `GEMINI_API_KEY` nas variáveis de produção e publique. Substitua o endereço do exemplo pela URL pública do projeto.

```http
POST https://SEU-PROJETO.vercel.app/perguntar
Content-Type: application/json

{
  "pergunta": "Como registrar meu humor no Entrelinhas?"
}
```

`app.js` contém as rotas `GET /saude` e `POST /perguntar`, a instrução de sistema, a leitura dos documentos e a leitura da chave. O modelo padrão, Gemini 3.5 Flash-Lite, atende perguntas curtas e possui modalidade gratuita para projetos elegíveis. `GEMINI_MODELO` permite trocar o modelo no servidor. A conversa é voltada a dúvidas gerais sobre o app e os guias. Dados da conta, registros, histórico e token ficam fora da requisição. O texto enviado na modalidade gratuita do Gemini pode ser usado pelo provedor para aprimorar produtos.

[Modelos e preços do Google AI Studio](https://ai.google.dev/gemini-api/docs/pricing). [Express na Vercel](https://vercel.com/docs/frameworks/backend/express).