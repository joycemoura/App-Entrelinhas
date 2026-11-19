import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { AvatarHumor, Aviso, Cartao, Link, Opcao, Tela, Texto, opcoes } from '../components/Interface';
import { atividades, humores } from '../constants/prototipo';
import { consultarRegistro } from '../services/api';
import { useEntrelinhas } from '../state/Entrelinhas';
import { dataCurta, horaCurta, lerDataHora } from '../utils/datas';

export default function CriarHumorScreen({ navigation, route }) {
  const { paleta, sessao, onSair, gravar } = useEntrelinhas();
  const id = route.params?.registroId;
  const [humor, setHumor] = useState(null);
  const [contextos, setContextos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [anotacao, setAnotacao] = useState('');
  const [detalhes, setDetalhes] = useState(Boolean(id));
  const [editarData, setEditarData] = useState(false);
  const [data, setData] = useState(() => dataCurta(new Date()));
  const [hora, setHora] = useState(() => horaCurta(new Date()));
  const [carregando, setCarregando] = useState(Boolean(id));
  const [erroCarga, setErroCarga] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const envioEmCurso = useRef(false);
  const selecionado = humores.find((item) => item.id === humor);

  useEffect(() => {
    if (!id) return;
    let ativo = true;

    consultarRegistro(sessao.token, id)
      .then((registro) => {
        if (!ativo) return;
        setHumor(registro.humor);
        setTitulo(registro.titulo ?? '');
        setAnotacao(registro.anotacao ?? '');
        setContextos(registro.contextos);
        const momento = new Date(registro.registrado_em);
        setData(dataCurta(momento));
        setHora(horaCurta(momento));
      })
      .catch((falha) => {
        if (!ativo) return;
        if (falha.status === 401) onSair();
        else setErroCarga(falha.message);
      })
      .finally(() => { if (ativo) setCarregando(false); });

    return () => { ativo = false; };
  }, [id, onSair, sessao.token]);

  function alternarContexto(opcao) {
    setContextos((atuais) => atuais.includes(opcao)
      ? atuais.filter((item) => item !== opcao)
      : [...atuais, opcao]);
  }

  async function salvar() {
    if (!selecionado || envioEmCurso.current) return;
    setErro('');

    const dados = { humor };
    if (detalhes) {
      Object.assign(dados, { contextos, titulo, anotacao });
      if (editarData) {
        dados.registrado_em = lerDataHora(data, hora);
        if (!dados.registrado_em) {
          setErro('Confira a data e a hora. Use DD/MM/AAAA e HH:MM.');
          return;
        }
      }
    }

    envioEmCurso.current = true;
    setSalvando(true);
    Keyboard.dismiss();

    try {
      await gravar(dados, id);
      if (navigation.isFocused()) setSalvo(true);
    } catch (falha) {
      if (navigation.isFocused()) setErro(Object.values(falha.campos ?? {}).join(' ') || falha.message);
    } finally {
      envioEmCurso.current = false;
      setSalvando(false);
    }
  }

  const voltar = () => navigation.goBack();

  if (salvo) {
    return (
      <Tela titulo={id ? 'Registro atualizado' : 'Registro salvo'} menu={false}>
        <Cartao suave>
          <AvatarHumor humor={selecionado} tamanho={84} />
          <Aviso>Seu registro está disponível no Histórico.</Aviso>
        </Cartao>
        <Botao titulo="Concluir" onPress={voltar} />
      </Tela>
    );
  }

  return (
    <Tela titulo={id ? 'Editar humor' : 'Criar humor'} descricao="Qual humor combina com agora?"
      menu={false} voltar={voltar} teclado>
      {carregando && <Aviso>Carregando registro...</Aviso>}
      {Boolean(erroCarga) && <Aviso erro>{erroCarga}</Aviso>}

      {!carregando && !erroCarga && (
        <>
          <View style={[opcoes, { justifyContent: 'center' }]}>
            {humores.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityLabel={item.nome}
                accessibilityState={{ checked: humor === item.id }}
                disabled={salvando}
                onPress={() => setHumor(item.id)}
                style={{
                  width: 66, minHeight: 84, gap: 5, borderWidth: 2, borderRadius: 16,
                  paddingVertical: 7, alignItems: 'center',
                  borderColor: humor === item.id ? paleta.destaque : 'transparent',
                }}
              >
                <AvatarHumor humor={item} tamanho={44} />
                <Texto variante="nota" style={{ textAlign: 'center' }}>{item.nome}</Texto>
              </Pressable>
            ))}
          </View>

          {selecionado && (
            <Cartao suave style={{ alignItems: 'center' }}>
              <AvatarHumor humor={selecionado} tamanho={84} />
              <Texto variante="secao">{selecionado.nome}</Texto>
            </Cartao>
          )}

          {!id && (
            <Link titulo={detalhes ? 'Ocultar detalhes' : 'Adicionar detalhes'}
              onPress={() => setDetalhes(!detalhes)} desabilitado={salvando} />
          )}

          {detalhes && (
            <Cartao>
              <Texto variante="secao">O seu contexto</Texto>

              {atividades.map(({ nome, opcoes: escolhas }) => (
                <View key={nome} style={{ gap: 8 }}>
                  <Texto>{nome}</Texto>
                  <View style={opcoes}>
                    {escolhas.map((opcao) => (
                      <Opcao key={opcao} titulo={opcao} ativa={contextos.includes(opcao)}
                        onPress={() => alternarContexto(opcao)} desabilitada={salvando} />
                    ))}
                  </View>
                </View>
              ))}

              <CampoTexto rotulo="Título" value={titulo} onChangeText={setTitulo} maxLength={120} editable={!salvando} />
              <CampoTexto rotulo="Sua nota" value={anotacao} onChangeText={setAnotacao} multiline maxLength={2000} editable={!salvando} />
              <Link titulo={editarData ? 'Usar a data padrão' : 'Escolher data e hora'}
                onPress={() => setEditarData(!editarData)} desabilitado={salvando} />

              {editarData && (
                <>
                  <CampoTexto rotulo="Data" placeholder="DD/MM/AAAA" value={data} onChangeText={setData} editable={!salvando} />
                  <CampoTexto rotulo="Hora" placeholder="HH:MM" value={hora} onChangeText={setHora} editable={!salvando} />
                </>
              )}
            </Cartao>
          )}

          {Boolean(erro) && <Aviso erro>{erro}</Aviso>}
          <Botao
            titulo={salvando ? 'Salvando...' : detalhes ? 'Salvar registro' : 'Salvar registro rápido'}
            onPress={salvar}
            desabilitado={!selecionado || salvando}
          />
        </>
      )}
    </Tela>
  );
}