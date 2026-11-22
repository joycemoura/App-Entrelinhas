import { stat } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';
import { GoogleGenAI } from '@google/genai';

const nomeBase = 'Entrelinhas - manuais PDF';
const tamanhoMaximo = 100_000_000;

async function executar() {
  const [acao, argumentoExtra] = process.argv.slice(2);
  if (!acao || argumentoExtra) {
    throw new Error('Informe --criar-base ou o caminho de um PDF entre aspas.');
  }

  const chave = process.env.GEMINI_API_KEY?.trim();
  if (!chave) throw new Error('Preencha GEMINI_API_KEY no .env da api-ia.');

  const ai = new GoogleGenAI({ apiKey: chave });
  const baseConfigurada = process.env.GEMINI_FILE_SEARCH_STORE?.trim();

  if (acao === '--criar-base') {
    if (baseConfigurada) {
      console.log('Base já configurada:', baseConfigurada);
      return;
    }

    const bases = await ai.fileSearchStores.list();
    for await (const base of bases) {
      if (base.displayName === nomeBase && base.name) {
        console.log('GEMINI_FILE_SEARCH_STORE=' + base.name);
        return;
      }
    }

    const base = await ai.fileSearchStores.create({
      config: { displayName: nomeBase, embeddingModel: 'models/gemini-embedding-2' },
    });
    if (!base.name) throw new Error('O Google não informou o nome da base.');
    console.log('GEMINI_FILE_SEARCH_STORE=' + base.name);
    return;
  }

  if (!/^fileSearchStores\/[a-z0-9-]+$/.test(baseConfigurada ?? '')) {
    throw new Error('Preencha GEMINI_FILE_SEARCH_STORE no .env da api-ia.');
  }

  if (extname(acao).toLowerCase() !== '.pdf') {
    throw new Error('Escolha um arquivo com extensão .pdf.');
  }
  const arquivo = await stat(acao);
  if (!arquivo.isFile() || arquivo.size === 0 || arquivo.size > tamanhoMaximo) {
    throw new Error('Escolha um PDF válido de até 100 MB.');
  }

  const titulo = basename(acao);
  const documentos = await ai.fileSearchStores.documents.list({ parent: baseConfigurada });
  for await (const documento of documentos) {
    if (documento.displayName === titulo && documento.state === 'STATE_ACTIVE') {
      console.log('PDF já indexado:', titulo);
      return;
    }
    if (documento.displayName === titulo && documento.state === 'STATE_PENDING') {
      console.log('PDF em processamento:', titulo);
      return;
    }
  }

  console.log('Importando:', titulo);
  let operacao = await ai.fileSearchStores.uploadToFileSearchStore({
    file: acao,
    fileSearchStoreName: baseConfigurada,
    config: { displayName: titulo, mimeType: 'application/pdf' },
  });

  while (!operacao.done) {
    await esperar(5_000);
    operacao = await ai.operations.get({ operation: operacao });
  }
  if (operacao.error) {
    throw new Error(operacao.error.message || 'O Google não conseguiu indexar o PDF.');
  }

  console.log('PDF indexado:', titulo);
}

try {
  await executar();
} catch (erro) {
  console.error(erro.message);
  process.exitCode = 1;
}