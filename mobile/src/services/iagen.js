// Depois de publicar a API, cole aqui a URL pública da Vercel, sem /perguntar.
const enderecoPublicado = 'https://api-ia-ten.vercel.app';

function enderecoDaIa() {
  if (enderecoPublicado.trim()) return enderecoPublicado.trim().replace(/\/+$/, '');

  // No Expo local, reaproveita o endereço do computador definido para a API de usuários.
  const enderecoUsuarios = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:3000';
  const local = /^(https?):\/\/(\[[^\]]+\]|[^:/?#\s]+)(?::\d+)?(?:[/?#]|$)/i.exec(enderecoUsuarios);
  if (!local) throw new Error('Confira o endereço da API de usuários para testar a IA localmente.');
  const [, protocolo, computador] = local;
  return protocolo + '://' + computador + ':3001';
}

export async function perguntarIa(pergunta, signal) {
  const controlador = new AbortController();
  const cancelar = () => controlador.abort();

  if (signal?.aborted) cancelar();
  signal?.addEventListener('abort', cancelar, { once: true });
  const limite = setTimeout(cancelar, 22_000);

  try {
    const resposta = await fetch(enderecoDaIa() + '/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta }),
      signal: controlador.signal,
    });
    const dados = await resposta.json();

    if (!resposta.ok) throw new Error(dados?.mensagem || 'A API de IA está indisponível.');
    if (typeof dados?.resposta !== 'string' || !dados.resposta.trim()) {
      throw new Error('A API de IA retornou uma resposta inválida.');
    }

    return {
      mensagem: dados.resposta,
      fontes: Array.isArray(dados.fontes) ? dados.fontes.filter((fonte) => typeof fonte === 'string') : [],
    };
  } catch (erro) {
    if (controlador.signal.aborted && !signal?.aborted) throw new Error('A IA demorou a responder. Tente novamente.');
    if (erro instanceof TypeError || erro instanceof SyntaxError) {
      throw new Error('Confira se a API de IA está rodando e se o endereço está correto.');
    }
    throw erro;
  } finally {
    clearTimeout(limite);
    signal?.removeEventListener('abort', cancelar);
  }
}