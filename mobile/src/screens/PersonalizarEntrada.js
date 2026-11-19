import { useRef, useState } from 'react';
import { Alert, Keyboard, View } from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { Cartao, Link, Opcao, Tela, Texto, opcoes } from '../components/Interface';
import { objetivos } from '../constants/prototipo';
import { useEntrelinhas } from '../state/Entrelinhas';

export default function PersonalizarEntrada({ navigation, route }) {
  const { preferencias, guardarPreferencias, nome } = useEntrelinhas();
  const [apelido, setApelido] = useState(preferencias.apelido);
  const [objetivo, setObjetivo] = useState(preferencias.objetivo);
  const [tema, setTema] = useState(preferencias.tema);
  const [ocupado, setOcupado] = useState(false);
  const emCurso = useRef(false);
  const edicao = route.params?.edicao;
  const etapa = route.name;
  const etapaNome = etapa === 'ComoChamar';
  const etapaObjetivo = etapa === 'Objetivo';
  const titulo = etapaNome ? 'Como chamar você?' : etapaObjetivo ? 'Seu objetivo' : 'Escolha de tema';

  async function avancar(valores, destino) {
    if (emCurso.current) return;

    emCurso.current = true;
    setOcupado(true);
    Keyboard.dismiss();

    try {
      await guardarPreferencias(valores);
      if (edicao) navigation.goBack();
      else if (destino) navigation.navigate(destino);
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
    } finally {
      emCurso.current = false;
      setOcupado(false);
    }
  }

  const valores = etapaNome ? { apelido: apelido.trim() }
    : etapaObjetivo ? { objetivo }
      : { tema, ...(!edicao ? { entradaConcluida: true } : {}) };
  const destino = etapaNome ? 'Objetivo' : etapaObjetivo ? 'EscolherTema' : undefined;

  return (
    <Tela titulo={titulo} menu={false} teclado={etapaNome}
      voltar={navigation.canGoBack() ? () => navigation.goBack() : undefined}>
      <Cartao>
        {etapaNome && (
          <CampoTexto rotulo="Nome ou apelido" value={apelido} placeholder={nome}
            maxLength={40} editable={!ocupado} onChangeText={setApelido} />
        )}

        {etapaObjetivo && (
          <>
            <Texto variante="nota">Escolha o que faz sentido para você agora.</Texto>
            {objetivos.map((item) => (
              <Opcao key={item} titulo={item} ativa={objetivo === item}
                onPress={() => setObjetivo(item)} desabilitada={ocupado} />
            ))}
          </>
        )}

        {!etapaNome && !etapaObjetivo && (
          <View style={opcoes}>
            <Opcao titulo="Tema claro" ativa={tema === 'claro'}
              onPress={() => setTema('claro')} desabilitada={ocupado} />
            <Opcao titulo="Tema escuro" ativa={tema === 'escuro'}
              onPress={() => setTema('escuro')} desabilitada={ocupado} />
          </View>
        )}
      </Cartao>

      <Botao titulo={edicao ? 'Salvar' : destino ? 'Continuar' : 'Entrar no meu espaço'}
        onPress={() => avancar(valores, destino)} desabilitado={ocupado} />

      {!edicao && (
        <Link titulo="Pular personalização" desabilitado={ocupado}
          onPress={() => avancar({ entradaConcluida: true })} />
      )}
    </Tela>
  );
}