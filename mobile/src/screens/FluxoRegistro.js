import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { AvatarHumor, Aviso, Cartao, Opcao, Tela, Texto, opcoes } from '../components/Interface';
import { consultarRegistro } from '../services/api';
import { useEntrelinhas } from '../state/Entrelinhas';
import { dataCurta, horaCurta, lerDataHora } from '../utils/datas';

const Stack = createNativeStackNavigator();
const Registro = createContext(null);

function Progresso({ etapa }) {
  const { paleta } = useEntrelinhas();

  return (
    <View style={{ flexDirection: 'row', gap: 6 }}
      accessibilityLabel={'Etapa ' + etapa + ' de 3'}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={{
          flex: 1, height: 3, borderRadius: 2,
          backgroundColor: item <= etapa ? paleta.acao : paleta.borda + '55',
        }} />
      ))}
    </View>
  );
}

function EscolherHumor({ navigation }) {
  const { meusHumores, paleta, escala } = useEntrelinhas();
  const { draft, atualizar, gravar, id, ocupado, erro } = useContext(Registro);
  const { width, fontScale } = useWindowDimensions();
  const compacto = width < 350 || escala > 1 || fontScale >= 1.29;
  const tamanho = compacto ? 50 : Math.min(54, Math.floor((width - 66) / 5));
  const selecionado = meusHumores.find((item) => item.id === draft.humor);

  return (
    <Tela titulo={id ? 'Editar registro' : 'Criar humor'} menu={false}
      voltar={() => navigation.goBack()}>
      <Progresso etapa={1} />
      <View style={estilos.bloco}>
        <Texto variante="secao">Qual humor combina com agora?</Texto>
        <Texto variante="nota">Não existe uma resposta certa.</Texto>
      </View>

      <View accessibilityRole="radiogroup" style={[estilos.humores, compacto && estilos.compacto]}>
        {meusHumores.map((humor) => {
          const marcado = draft.humor === humor.id;

          return (
            <Pressable key={humor.id} accessibilityRole="radio" accessibilityLabel={humor.nome}
              accessibilityState={{ checked: marcado, disabled: ocupado }} disabled={ocupado}
              onPress={() => atualizar({ humor: humor.id })}
              style={({ pressed }) => [
                estilos.humor, compacto && estilos.humorCompacto,
                {
                  borderColor: marcado ? paleta.destaque : 'transparent',
                  backgroundColor: marcado ? paleta.superficieSuave : 'transparent',
                  opacity: pressed ? 0.82 : 1,
                },
              ]}>
              <View>
                <AvatarHumor humor={humor} tamanho={tamanho} />
                {marcado && (
                  <View style={[estilos.check, { backgroundColor: paleta.acao }]}>
                    <Ionicons name="checkmark" size={12} color={paleta.textoSobreAcao} />
                  </View>
                )}
              </View>
              <Texto variante="nota" style={[estilos.rotulo, !compacto && { fontSize: 11.5 },
                marcado && { fontWeight: '700', color: paleta.texto }]}>{humor.nome}</Texto>
            </Pressable>
          );
        })}
      </View>

      {selecionado && (
        <View style={estilos.previa}>
          <AvatarHumor humor={selecionado} tamanho={92} />
          <Texto variante="editorial">{selecionado.nome}</Texto>
        </View>
      )}

      {Boolean(erro) && <Aviso erro>{erro}</Aviso>}
      <View style={estilos.acoes}>
        <Botao titulo="Complementar registro" desabilitado={!selecionado || ocupado}
          onPress={() => navigation.navigate('ContextoRegistro')} />
        {!id && !draft.anotacao.trim() && (
          <Botao titulo={ocupado ? 'Salvando...' : 'Salvar registro rápido'}
            onPress={() => gravar(navigation, true)} desabilitado={!selecionado || ocupado} secundario />
        )}
      </View>
    </Tela>
  );
}

function ContextoRegistro({ navigation }) {
  const { preferencias, meusHumores } = useEntrelinhas();
  const { draft, atualizar, dataAlterada, erro } = useContext(Registro);
  const humor = meusHumores.find((item) => item.id === draft.humor);

  function alternar(item) {
    const contextos = draft.contextos.includes(item)
      ? draft.contextos.filter((opcao) => opcao !== item)
      : [...draft.contextos, item];
    atualizar({ contextos });
  }

  function continuar() {
    const dataOk = !dataAlterada || lerDataHora(draft.data, draft.hora);
    if (!dataOk) {
      atualizar({}, 'Confira a data e a hora. Use DD/MM/AAAA e HH:MM.');
      return;
    }
    Keyboard.dismiss();
    navigation.navigate('NotaRegistro');
  }

  return (
    <Tela titulo="O seu contexto" descricao="Adicione o que quiser lembrar deste momento."
      menu={false} teclado voltar={() => navigation.goBack()}>
      <Progresso etapa={2} />
      {humor && (
        <Cartao style={estilos.linha}>
          <AvatarHumor humor={humor} tamanho={46} />
          <Texto variante="secao" style={{ flex: 1 }}>{humor.nome}</Texto>
        </Cartao>
      )}

      <Cartao>
        <CampoTexto rotulo="Data" placeholder="DD/MM/AAAA" value={draft.data}
          onChangeText={(data) => atualizar({ data })} />
        <CampoTexto rotulo="Hora" placeholder="HH:MM" value={draft.hora}
          onChangeText={(hora) => atualizar({ hora })} />
      </Cartao>

      {preferencias.grupos.map(({ nome, opcoes: itens }, indice) => (
        <Cartao key={indice}>
          <Texto variante="secao">{nome}</Texto>
          <View style={opcoes}>
            {itens.map((item) => (
              <Opcao key={item} titulo={item} ativa={draft.contextos.includes(item)}
                onPress={() => alternar(item)} />
            ))}
          </View>
        </Cartao>
      ))}

      {Boolean(erro) && <Aviso erro>{erro}</Aviso>}
      <Botao titulo="Continuar para a nota" onPress={continuar} />
    </Tela>
  );
}

function NotaRegistro({ navigation }) {
  const { draft, atualizar, gravar, ocupado, erro } = useContext(Registro);

  return (
    <Tela titulo="Seu momento" descricao="Se quiser, deixe algumas palavras para lembrar."
      menu={false} teclado voltar={() => navigation.goBack()}>
      <Progresso etapa={3} />

      <Cartao>
        <CampoTexto rotulo="Um título para lembrar" value={draft.titulo} maxLength={120}
          onChangeText={(titulo) => atualizar({ titulo })} editable={!ocupado} />
        <CampoTexto rotulo="Sua nota" value={draft.anotacao} maxLength={2000} multiline
          onChangeText={(anotacao) => atualizar({ anotacao })} editable={!ocupado} />
      </Cartao>

      {Boolean(erro) && <Aviso erro>{erro}</Aviso>}
      <Botao titulo={ocupado ? 'Salvando...' : 'Salvar registro'}
        onPress={() => gravar(navigation)} desabilitado={ocupado} />
    </Tela>
  );
}

function RegistroSalvo() {
  const { meusHumores } = useEntrelinhas();
  const { salvo, id, fechar, verHistorico } = useContext(Registro);
  const humor = meusHumores.find((item) => item.id === salvo?.humor);

  return (
    <Tela titulo={id ? 'Registro atualizado' : 'Registro salvo'} menu={false}>
      <Cartao suave style={estilos.previa}>
        <AvatarHumor humor={humor} tamanho={98} />
        <Texto variante="secao">{humor?.nome}</Texto>
        <Texto variante="nota">Seu momento já aparece no Histórico.</Texto>
      </Cartao>
      <Botao titulo="Concluir" onPress={fechar} />
      <Botao titulo="Abrir histórico" onPress={verHistorico} secundario />
    </Tela>
  );
}

export default function FluxoRegistro({ navigation, route }) {
  const { sessao, onSair, gravar, preferencias } = useEntrelinhas();
  const id = route.params?.registroId;
  const [draft, setDraft] = useState(() => {
    const agora = new Date();
    return {
      humor: null, contextos: [], titulo: '', anotacao: route.params?.anotacao ?? '',
      data: dataCurta(agora), hora: horaCurta(agora),
    };
  });
  const original = useRef(draft);
  const [carregando, setCarregando] = useState(Boolean(id));
  const [erroCarga, setErroCarga] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [salvo, setSalvo] = useState(null);
  const emCurso = useRef(false);
  const dataAlterada = draft.data !== original.current.data || draft.hora !== original.current.hora;

  useEffect(() => {
    if (!id) return;
    let ativa = true;

    consultarRegistro(sessao.token, id)
      .then((registro) => {
        if (!ativa) return;
        const momento = new Date(registro.registrado_em);
        const valores = {
          humor: registro.humor,
          contextos: registro.contextos,
          titulo: registro.titulo ?? '',
          anotacao: registro.anotacao ?? '',
          data: dataCurta(momento),
          hora: horaCurta(momento),
        };
        original.current = valores;
        setDraft(valores);
      })
      .catch((falha) => {
        if (!ativa) return;
        if (falha.status === 401) onSair();
        else setErroCarga(falha.message);
      })
      .finally(() => { if (ativa) setCarregando(false); });

    return () => { ativa = false; };
  }, [id, sessao.token, onSair]);

  function atualizar(dados, mensagem = '') {
    setDraft((atual) => ({ ...atual, ...dados }));
    setErro(mensagem);
  }

  async function salvar(etapas, rapido = false) {
    if (!draft.humor || emCurso.current) return;
    const dados = { humor: draft.humor };

    if (!rapido) {
      Object.assign(dados, { contextos: draft.contextos, titulo: draft.titulo, anotacao: draft.anotacao });
      if (dataAlterada) {
        dados.registrado_em = lerDataHora(draft.data, draft.hora);
        if (!dados.registrado_em) {
          setErro('Confira a data e a hora na etapa anterior.');
          return;
        }
      }
    }

    emCurso.current = true;
    setOcupado(true);
    setErro('');
    Keyboard.dismiss();

    try {
      const registro = await gravar(dados, id);
      if (navigation.isFocused()) {
        setSalvo(registro);
        etapas.reset({ index: 0, routes: [{ name: 'RegistroSalvo' }] });
      }
    } catch (falha) {
      if (navigation.isFocused()) setErro(Object.values(falha.campos ?? {}).join(' ') || falha.message);
    } finally {
      emCurso.current = false;
      setOcupado(false);
    }
  }

  if (carregando || erroCarga) {
    return (
      <Tela titulo="Editar registro" menu={false} voltar={() => navigation.goBack()}>
        <Aviso erro={Boolean(erroCarga)}>{erroCarga || 'Carregando registro...'}</Aviso>
      </Tela>
    );
  }

  return (
    <Registro.Provider value={{
      draft, atualizar, id, dataAlterada, erro, ocupado, salvo, gravar: salvar,
      fechar: () => navigation.goBack(),
      verHistorico: () => navigation.popTo('Menu', { screen: 'Historico' }),
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: preferencias.reduzirMovimento ? 'none' : 'default' }}>
        <Stack.Screen name="EscolherHumor" component={EscolherHumor} />
        <Stack.Screen name="ContextoRegistro" component={ContextoRegistro} />
        <Stack.Screen name="NotaRegistro" component={NotaRegistro} />
        <Stack.Screen name="RegistroSalvo" component={RegistroSalvo} />
      </Stack.Navigator>
    </Registro.Provider>
  );
}

const estilos = StyleSheet.create({
  bloco: { gap: 5 },
  humores: { flexDirection: 'row', gap: 2 },
  compacto: { flexWrap: 'wrap', justifyContent: 'center' },
  humor: {
    flex: 1, minWidth: 0, minHeight: 85, alignItems: 'center',
    gap: 7, paddingVertical: 8, borderWidth: 1, borderRadius: 15,
  },
  humorCompacto: { flex: 0, width: '31%' },
  rotulo: { textAlign: 'center' },
  check: {
    position: 'absolute', top: -4, right: -4, width: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  previa: { alignItems: 'center', gap: 6, paddingVertical: 12 },
  acoes: { gap: 10 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});