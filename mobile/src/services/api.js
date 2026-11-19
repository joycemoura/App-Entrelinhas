const urlApi = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
const rotaRegistros = '/registros-humor';

async function solicitar(rota, { metodo = 'GET', dados, token } = {}) {
  if (!urlApi) {
    throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo mobile/.env.');
  }

  const headers = { Accept: 'application/json' };
  if (dados !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 12000);
  let resposta;
  let resultado;

  try {
    resposta = await fetch(urlApi + rota, {
      method: metodo,
      headers,
      body: dados === undefined ? undefined : JSON.stringify(dados),
      signal: controle.signal,
    });
    resultado = await resposta.json().catch(() => null);
  } catch {
    if (!controle.signal.aborted) {
      throw new Error('Confira se a API está rodando e se o endereço em mobile/.env está correto.');
    }
  } finally {
    clearTimeout(limite);
  }

  if (controle.signal.aborted) {
    const mensagem = rota.startsWith(rotaRegistros) && metodo !== 'GET'
      ? 'A API demorou a responder. Confira o histórico para ver se a alteração foi salva.'
      : 'A API demorou a responder. Confira a conexão e tente novamente.';
    throw new Error(mensagem);
  }

  if (!resposta.ok) {
    const erro = new Error(resultado?.mensagem || `A API respondeu com status ${resposta.status}.`);
    erro.status = resposta.status;
    erro.campos = resultado?.erros ?? {};
    throw erro;
  }

  if (!resultado || typeof resultado !== 'object' || Array.isArray(resultado)) {
    throw new Error('A API devolveu uma resposta inesperada.');
  }

  return resultado;
}

export function cadastrarUsuario({ nome, email, telefone, senha }) {
  return solicitar('/auth/cadastro', {
    metodo: 'POST',
    dados: { nome, email, telefone, senha },
  });
}

export function fazerLogin(email, senha) {
  return solicitar('/auth/login', { metodo: 'POST', dados: { email, senha } });
}

export async function listarRegistros(token) {
  const { registros } = await solicitar(rotaRegistros, { token });
  if (!Array.isArray(registros)) throw new Error('A API não retornou a lista de registros.');
  return registros;
}

export async function salvarRegistro(token, dados, id) {
  const { registro } = await solicitar(id ? `${rotaRegistros}/${id}` : rotaRegistros, {
    metodo: id ? 'PUT' : 'POST',
    token,
    dados,
  });
  if (!registro?.id) throw new Error('A API não confirmou o registro.');
  return registro;
}

export function excluirRegistro(token, id) {
  return solicitar(`${rotaRegistros}/${id}`, { metodo: 'DELETE', token });
}

export async function consultarRegistro(token, id) {
  const { registro } = await solicitar(`${rotaRegistros}/${id}`, { token });
  if (!registro?.id) throw new Error('A API não retornou o registro.');
  return registro;
}

export async function consultarMinhaConta(token) {
  const { usuario } = await solicitar('/auth/me', { token });
  if (!usuario?.id) throw new Error('A API não retornou os dados da conta.');
  return usuario;
}

export function excluirMinhaConta(token) {
  return solicitar('/auth/me', { metodo: 'DELETE', token });
}