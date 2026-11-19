import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { deleteAsync, EncodingType, StorageAccessFramework } from 'expo-file-system/legacy';

import { humores as humoresPadrao } from '../constants/prototipo';
import { momentoLocal } from '../utils/datas';

function escaparHtml(valor) {
  const entidades = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(valor ?? '').replace(/[&<>"']/g, (caractere) => entidades[caractere]);
}

export function montarRelatorio({ registros, perfil, periodo, humores = humoresPadrao }) {
  const linhas = registros.map((registro) => {
    const humor = humores.find(({ id }) => id === registro.humor);
    return `<article>
      <h2>${escaparHtml(registro.titulo || humor?.nome)}</h2>
      <p class="data">${escaparHtml(momentoLocal(registro.registrado_em))} · ${escaparHtml(humor?.nome)}</p>
      ${registro.contextos.length ? `<p>Contextos: ${escaparHtml(registro.contextos.join(', '))}</p>` : ''}
      ${registro.anotacao ? `<p class="nota">${escaparHtml(registro.anotacao)}</p>` : ''}
    </article>`;
  }).join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Entrelinhas · Histórico de humor</title>
<style>
  @page { margin: 15mm; }
  body { font: 11pt sans-serif; color: #342D27; margin: 0; }
  header { border-bottom: 2px solid #9B5A30; margin-bottom: 16px; padding-bottom: 10px; }
  h1 { font: 23pt Georgia, serif; margin: 0 0 8px; }
  h2 { font-size: 13pt; margin: 0 0 4px; }
  p { margin: 0 0 6px; }
  article { border-bottom: 1px solid #ddd2c8; margin-bottom: 12px; padding-bottom: 10px; }
  h2 { break-after: avoid; }
  .data { color: #68594f; }
  .nota { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
</head>
<body>
  <header>
    <h1>Entrelinhas · Histórico de humor</h1>
    <p>${escaparHtml(perfil.nome)}</p>
    ${perfil.email ? `<p>E-mail: ${escaparHtml(perfil.email)}</p>` : ''}
    ${perfil.telefone ? `<p>Telefone: ${escaparHtml(perfil.telefone)}</p>` : ''}
    ${perfil.criado_em ? `<p>Conta criada em: ${escaparHtml(momentoLocal(perfil.criado_em))}</p>` : ''}
    <p>${escaparHtml(periodo)} · ${registros.length} registro${registros.length === 1 ? '' : 's'}</p>
    <p class="data">Gerado em ${escaparHtml(momentoLocal(new Date().toISOString()))}</p>
  </header>
  ${linhas || '<p>Nenhum registro no período.</p>'}
</body>
</html>`;
}

function erroAoSalvarNaPasta(causa) {
  const erro = new Error('O Android não conseguiu gravar o PDF nessa pasta.', { cause: causa });
  erro.codigo = 'PASTA_PDF';
  return erro;
}

export async function salvarRelatorioPdf({ html, nomeArquivo, podeSalvar, imprimir = false }) {
  if (Platform.OS === 'web') {
    throw new Error('Abra o Entrelinhas no celular para salvar o PDF.');
  }

  if (!podeSalvar()) return;

  if (imprimir) {
    await Print.printAsync({ html });
    return;
  }

  const android = Platform.OS === 'android';
  let pasta;

  if (android) {
    const documentos = StorageAccessFramework.getUriForDirectoryInRoot('Documents');
    try {
      const permissao = await StorageAccessFramework.requestDirectoryPermissionsAsync(documentos);
      if (!podeSalvar()) return;
      if (!permissao.granted) return 'cancelado';
      pasta = permissao.directoryUri;
    } catch (erro) {
      throw erroAoSalvarNaPasta(erro);
    }
  } else if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento de arquivos está indisponível neste aparelho.');
  }

  if (!podeSalvar()) return;
  const pdf = await Print.printToFileAsync({ html, base64: android });

  try {
    if (!podeSalvar()) return;

    if (android) {
      if (!pdf.base64) throw new Error('A geração do PDF não foi concluída.');
      let destino;
      try {
        destino = await StorageAccessFramework.createFileAsync(pasta, nomeArquivo, 'application/pdf');
        if (!podeSalvar()) {
          await deleteAsync(destino, { idempotent: true }).catch(() => {});
          return;
        }
        await StorageAccessFramework.writeAsStringAsync(destino, pdf.base64, { encoding: EncodingType.Base64 });
      } catch (erro) {
        if (destino) await deleteAsync(destino, { idempotent: true }).catch(() => {});
        throw erroAoSalvarNaPasta(erro);
      }

      return 'salvo';
    }

    await Sharing.shareAsync(pdf.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  } finally {
    await deleteAsync(pdf.uri, { idempotent: true }).catch(() => {});
  }
}