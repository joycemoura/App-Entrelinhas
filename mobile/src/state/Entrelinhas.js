import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { cores } from '../constants/tema';
import { atividades, fundosAvatar, humores, modulosInicio, objetivos, retratos } from '../constants/prototipo';
import { excluirMinhaConta, excluirRegistro, listarRegistros, salvarRegistro } from '../services/api';

const escuro = {
  fundo: '#241F25',
  superficie: '#302931',
  superficieSuave: '#3E343A',
  texto: '#FFF6F1',
  textoSecundario: '#DCCBC5',
  acao: '#FFA872',
  destaque: '#FFD1AC',
  borda: '#8A767E',
  desabilitado: '#54464D',
  textoDesabilitado: '#E7D5D5',
  erro: '#FFC8C6',
};

const preferenciasIniciais = {
  apelido: '',
  tema: 'claro',
  contraste: false,
  fonteMaior: false,
  retrato: 0,
  fundoAvatar: 0,
  objetivo: '',
  entradaConcluida: false,
  rotulos: {},
  coresHumores: {},
  reduzirMovimento: false,
  grupos: atividades,
  ordem: modulosInicio.map(({ id }) => id),
};

const Contexto = createContext(null);

function restaurarPreferencias(texto) {
  const salvo = JSON.parse(texto ?? '{}') ?? {};
  const ordemPadrao = preferenciasIniciais.ordem;
  const ordem = Array.isArray(salvo.ordem)
    ? [...new Set(salvo.ordem.filter((id) => ordemPadrao.includes(id)))]
    : [];
  const grupos = Array.isArray(salvo.grupos)
    ? salvo.grupos
        .filter((grupo) => typeof grupo?.nome === 'string' && grupo.nome.trim()
          && Array.isArray(grupo.opcoes))
        .slice(0, 12)
        .map(({ nome, opcoes }) => ({
          nome: nome.trim().slice(0, 30),
          opcoes: [...new Set(opcoes.filter((item) => typeof item === 'string' && item.trim())
            .map((item) => item.trim().slice(0, 40)))].slice(0, 16),
        }))
    : atividades;
  const rotulos = Object.fromEntries(humores.map(({ id, nome }) => [
    id, typeof salvo.rotulos?.[id] === 'string' && salvo.rotulos[id].trim()
      ? salvo.rotulos[id].trim().slice(0, 18) : nome,
  ]));

  return {
    objetivo: objetivos.includes(salvo.objetivo) ? salvo.objetivo : '',
    entradaConcluida: salvo.entradaConcluida === true,
    grupos,
    rotulos,
    reduzirMovimento: salvo.reduzirMovimento === true,
    coresHumores: Object.fromEntries(humores.map(({ id, cor }) => [
      id, /^#[0-9a-f]{6}$/i.test(salvo.coresHumores?.[id]) ? salvo.coresHumores[id] : cor,
    ])),
    ordem: [...ordem, ...ordemPadrao.filter((id) => !ordem.includes(id))],
    apelido: typeof salvo.apelido === 'string' ? salvo.apelido.slice(0, 40) : '',
    tema: salvo.tema === 'escuro' ? 'escuro' : 'claro',
    contraste: salvo.contraste === true,
    fonteMaior: salvo.fonteMaior === true,
    retrato: Number.isInteger(salvo.retrato) && retratos[salvo.retrato] ? salvo.retrato : 0,
    fundoAvatar: Number.isInteger(salvo.fundoAvatar) && fundosAvatar[salvo.fundoAvatar] ? salvo.fundoAvatar : 0,
  };
}

export function ProvedorEntrelinhas({ sessao, onSair, children }) {
  const token = sessao?.token;
  const chave = sessao ? `entrelinhas/preferencias/${sessao.usuario.id}` : null;
  const [preferencias, setPreferencias] = useState(preferenciasIniciais);
  const [preferenciasProntas, setPreferenciasProntas] = useState(!chave);
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(Boolean(token));
  const [erroHistorico, setErroHistorico] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const ultimaConsulta = useRef(0);
  const preferenciasAtuais = useRef(preferenciasIniciais);
  const persistencia = useRef(Promise.resolve());

  useEffect(() => {
    if (!chave) return;

    let ativo = true;
    AsyncStorage.getItem(chave)
      .then((salvo) => {
        if (!ativo) return;
        preferenciasAtuais.current = restaurarPreferencias(salvo);
        setPreferencias(preferenciasAtuais.current);
      })
      .catch(() => {})
      .finally(() => { if (ativo) setPreferenciasProntas(true); });

    return () => { ativo = false; };
  }, [chave]);

  const carregarHistorico = useCallback(async () => {
    if (!token) return;

    const consulta = ++ultimaConsulta.current;
    setCarregando(true);
    setErroHistorico('');

    try {
      const encontrados = await listarRegistros(token);
      if (consulta === ultimaConsulta.current) setRegistros(encontrados);
    } catch (erro) {
      if (consulta === ultimaConsulta.current) {
        if (erro.status === 401) onSair();
        else setErroHistorico(erro.message);
      }
    } finally {
      if (consulta === ultimaConsulta.current) setCarregando(false);
    }
  }, [onSair, token]);

  useEffect(() => {
    carregarHistorico();
    return () => { ultimaConsulta.current += 1; };
  }, [carregarHistorico]);

  function guardarPreferencias(novas) {
    const tarefa = persistencia.current.then(async () => {
      const atualizadas = restaurarPreferencias(JSON.stringify({
        ...preferenciasAtuais.current,
        ...novas,
      }));
      await AsyncStorage.setItem(chave, JSON.stringify(atualizadas));
      preferenciasAtuais.current = atualizadas;
      setPreferencias(atualizadas);
    });

    persistencia.current = tarefa.catch(() => {});
    return tarefa;
  }

  async function gravar(dados, id) {
    try {
      const salvo = await salvarRegistro(token, dados, id);
      setRegistros((atuais) => [salvo, ...atuais.filter((item) => item.id !== salvo.id)]
        .sort((a, b) => Date.parse(b.registrado_em) - Date.parse(a.registrado_em) || b.id - a.id));
      carregarHistorico();
      return salvo;
    } catch (erro) {
      if (erro.status === 401) onSair();
      throw erro;
    }
  }

  async function apagar(id) {
    try {
      await excluirRegistro(token, id);
      setRegistros((atuais) => atuais.filter((item) => item.id !== id));
      carregarHistorico();
    } catch (erro) {
      if (erro.status === 401) onSair();
      throw erro;
    }
  }

  async function apagarConta() {
    await persistencia.current;
    await excluirMinhaConta(token);
    try {
      await AsyncStorage.removeItem(chave);
    } finally {
      onSair();
    }
  }

  const temaEscuro = preferencias.tema === 'escuro';
  const contraste = temaEscuro
    ? { textoSecundario: '#FFF6F1', borda: '#DCCBC5', destaque: '#FFE4D0' }
    : { textoSecundario: '#443730', borda: '#665750', destaque: '#6C3518' };
  const paleta = {
    ...cores,
    ...(temaEscuro ? escuro : {}),
    ...(preferencias.contraste ? contraste : {}),
  };

  const meusHumores = humores.map((humor) => ({
    ...humor,
    nome: preferencias.rotulos[humor.id] || humor.nome,
    cor: preferencias.coresHumores[humor.id] || humor.cor,
  }));

  return (
    <Contexto.Provider value={{
      paleta, preferencias, preferenciasProntas, guardarPreferencias, sessao, onSair,
      escala: preferencias.fonteMaior ? 1.18 : 1,
      nome: preferencias.apelido || sessao?.usuario.nome || '',
      registros, carregando, erroHistorico, carregarHistorico, gravar, apagar, apagarConta,
      mensagens, setMensagens, meusHumores,
    }}>
      {children}
    </Contexto.Provider>
  );
}

export function useEntrelinhas() {
  return useContext(Contexto);
}