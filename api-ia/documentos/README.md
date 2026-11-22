# Materiais de referência do Entrelinhas

Esta pasta reúne materiais para a base de consulta da conversa com IA. Os três guias do Entrelinhas foram redigidos para o projeto acadêmico. As duas cartilhas institucionais já foram importadas no Gemini pela equipe do projeto e estão identificadas com os nomes usados no upload.

| Arquivo | Temas |
| --- | --- |
| [01-emocoes-e-estresse.pdf](01-emocoes-e-estresse.pdf) | Estresse cotidiano, identificação de emoções, registros de reflexão e aterramento |
| [02-sono-e-autocuidado.pdf](02-sono-e-autocuidado.pdf) | Higiene do sono, rotina, hábitos de autocuidado e observação de padrões |
| [03-rede-de-apoio.pdf](03-rede-de-apoio.pdf) | Pessoas de confiança, Unidade Básica de Saúde e acolhimento nos CAPS |

## Cartilhas da base

| Nome do arquivo | Publicação | Página oficial |
| --- | --- | --- |
| `MPCE_Cartilha-Anexo_1.pdf` | Ministério Público do Estado do Ceará, _Cartilha Saúde Mental_, campanha Janeiro Branco de 2026, 28 páginas | [Repositório do CNMP](https://www.cnmp.mp.br/portal/images/Comissoes/CES/Saude_Mental/Respositorio/CAMPANHAS/01-JANEIRO_BRANCO/MPCE_Cartilha-Anexo_1.pdf) |
| `Cartilha “Saúde mental e Bem estar”.pdf` | Universidade Federal Rural da Amazônia, _Saúde mental e bem estar_, 2022, 22 páginas | [Registro institucional da UFRA](https://repositorio.ufra.edu.br/jspui/handle/123456789/1612) |

Inclua as cópias integrais das cartilhas de terceiros em um repositório público quando houver permissão de republicação. O professor pode usar os links oficiais acima e salvar os PDFs com os nomes indicados para reproduzir a avaliação. O pacote de conferência contém as cópias enviadas pela equipe do projeto.

## Reproduzir a base de consulta

1. Abra a pasta do repositório no VS Code. Os comandos usam o script `api-ia/importar-pdf.js` e a versão da API configurada para o Gemini File Search.
2. No PowerShell da raiz do projeto, instale as dependências da API de IA.

```powershell
cd api-ia
npm.cmd install
```

3. Crie `api-ia/.env` no seu computador e preencha `GEMINI_API_KEY` com a sua chave. Use o comando abaixo para obter o identificador da base. Copie a linha `GEMINI_FILE_SEARCH_STORE=...` que o terminal exibir para o mesmo arquivo. A chave fica no ambiente local.

```powershell
node --env-file=.env importar-pdf.js --criar-base
```

4. Coloque os PDFs do conjunto avaliado em `api-ia/documentos/`. Para o conjunto completo, use os três guias e as duas cartilhas da tabela. Ainda dentro de `api-ia`, execute o bloco abaixo para importar os PDFs dessa pasta. Ele também funciona com nomes que têm espaços e aspas tipográficas.

```powershell
Get-ChildItem -LiteralPath ".\documentos" -Filter "*.pdf" -File | Sort-Object Name | ForEach-Object {
    node --env-file=.env importar-pdf.js $_.FullName
    if ($LASTEXITCODE -ne 0) { throw "Falha ao importar $($_.Name)." }
}
```

Aguarde `PDF indexado` ou `PDF já indexado` para cada arquivo. As cartilhas que já estão na base do app estão prontas para consulta.

5. Rode `npm.cmd run dev`. Com a API em execução, consulte [a rota de saúde](http://localhost:3001/saude) e confira `chaveConfigurada` e `baseConfigurada`. Para testar uma pergunta na API local, execute o exemplo em outro terminal PowerShell.

```powershell
$corpo = @{ pergunta = "O que significa higiene do sono?" } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri "http://localhost:3001/perguntar" -ContentType "application/json" -Body ([System.Text.Encoding]::UTF8.GetBytes($corpo))
```

Os PDFs no repositório servem para consulta e reprodução da avaliação. O aplicativo consulta os arquivos indexados na base do Google identificada por `GEMINI_FILE_SEARCH_STORE`. Para a avaliação refletir a base usada pelo aplicativo, confira que os PDFs indexados correspondem ao conjunto entregue ou referenciado neste documento.

## Testes para avaliação

| Pergunta | Resultado esperado |
| --- | --- |
| O que é aterramento? | Explicação apoiada em `01-emocoes-e-estresse.pdf`. |
| O que significa higiene do sono? | Explicação apoiada em material sobre sono. |
| Que tipos de autocuidado a cartilha da UFRA apresenta? | Resposta com referência à cartilha da UFRA. |
| Que fatores podem influenciar a saúde mental segundo a cartilha do MPCE? | Resposta com referência à cartilha do MPCE. |
| É preciso encaminhamento para o primeiro acolhimento em um CAPS? | Resposta apoiada em `03-rede-de-apoio.pdf`. |
| Qual é a capital do Japão? | Mensagem informando que o material não oferece base para responder. |
| Como exporto meus registros no Entrelinhas? | Mensagem informando que o material não oferece base para responder. |

## Publicações consultadas

- OPAS/OMS. _Faça o que importa em tempos de estresse_. Versão adaptada para o Brasil. [Publicação](https://www.paho.org/pt/documentos/faca-que-importa-em-tempos-estresse-guia-ilustrado-versao-adaptada-para-brasil)
- Organização Mundial da Saúde. _Stress_. Perguntas e respostas. [Publicação](https://www.who.int/news-room/questions-and-answers/item/stress)
- Hospital Universitário da UFMA. _Orientações para Higiene do Sono_. [Cartilha](https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-nordeste/hu-ufma/saude/area-do-paciente/cartinha_do_sono.pdf)
- Ministério da Saúde. _Centros de Atenção Psicossocial (CAPS)_. [Página institucional](https://www.gov.br/saude/pt-br/composicao/saes/desmad/raps/caps)
- Ministério da Saúde. _Saúde mental no SUS. Saiba como buscar atendimento_. [Página institucional](https://www.gov.br/saude/pt-br/assuntos/noticias/2025/setembro/saude-mental-no-sus-saiba-como-buscar-atendimento)
