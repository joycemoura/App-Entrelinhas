import { useRef, useState } from 'react';
import { Alert, Keyboard, Linking, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { AvatarHumor, Cartao, Link, Opcao, Retrato, Tela, Texto, linha, opcoes } from '../components/Interface';
import { atividades, fundosAvatar, humores, modulosInicio, retratos } from '../constants/prototipo';
import { useEntrelinhas } from '../state/Entrelinhas';
import { PoliticaPrivacidade } from './TermosScreen';

const personalizar = [
  ['Meu avatar', 'person-circle-outline', 'MeuAvatar'],
  ['Nome ou apelido', 'person-outline', 'ComoChamar'],
  ['Seu objetivo', 'flag-outline', 'Objetivo'],
  ['Meus humores', 'happy-outline', 'EditarHumores'],
  ['Minhas atividades', 'list-outline', 'EditarAtividades'],
  ['Tema e organização', 'color-palette-outline', 'TemaOrganizacao'],
];

const experiencia = [
  ['Conversa com IA', 'chatbubble-outline', 'Conversa'],
  ['Lembretes', 'notifications-outline', 'Lembretes'],
  ['Acessibilidade', 'accessibility-outline', 'Acessibilidade'],
  ['Privacidade e dados', 'shield-checkmark-outline', 'Privacidade'],
];

export function ConfiguracoesScreen({ navigation }) {
  const { nome, preferencias, paleta, onSair } = useEntrelinhas();

  function renderItem([titulo, icone, destino]) {
    return (
      <Pressable key={destino} accessibilityRole="button"
        onPress={() => navigation.navigate(destino, { edicao: true })}
        style={[estilos.item, { borderBottomColor: paleta.borda + '45' }]}>
        <View style={[estilos.icone, { backgroundColor: paleta.superficieSuave }]}>
          <Ionicons name={icone} size={20} color={paleta.destaque} />
        </View>
        <Texto style={{ flex: 1 }}>{titulo}</Texto>
        <Ionicons name="chevron-forward" size={16} color={paleta.textoSecundario} />
      </Pressable>
    );
  }

  return (
    <Tela titulo="Seu espaço" descricao="Do seu jeito, no seu ritmo.">
      <Cartao style={linha} suave>
        <Retrato preferencias={preferencias} tamanho={56} />
        <Texto variante="secao" style={{ flex: 1 }}>{nome}</Texto>
        <Link titulo="Editar avatar" onPress={() => navigation.navigate('MeuAvatar')} />
      </Cartao>

      <Texto variante="secao">Personalizar</Texto>
      <Cartao style={estilos.lista}>{personalizar.map(renderItem)}</Cartao>

      <Texto variante="secao">Sua experiência</Texto>
      <Cartao style={estilos.lista}>{experiencia.map(renderItem)}</Cartao>

      <Botao titulo="Sair da conta" onPress={onSair} secundario />
    </Tela>
  );
}

function useEdicao(navigation) {
  const { preferencias, guardarPreferencias } = useEntrelinhas();
  const [draft, setDraft] = useState(preferencias);
  const [ocupado, setOcupado] = useState(false);
  const emCurso = useRef(false);

  function atualizar(valores) {
    setDraft((atual) => ({ ...atual, ...valores }));
  }

  async function salvar(valores) {
    if (emCurso.current) return;
    emCurso.current = true;
    setOcupado(true);
    Keyboard.dismiss();

    try {
      await guardarPreferencias(valores);
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
    } finally {
      emCurso.current = false;
      setOcupado(false);
    }
  }

  return { draft, atualizar, salvar, ocupado };
}

export function MeuAvatarScreen({ navigation }) {
  const { paleta } = useEntrelinhas();
  const { draft, atualizar, salvar, ocupado } = useEdicao(navigation);

  return (
    <Tela titulo="Meu avatar" menu={false} voltar={() => navigation.goBack()}>
      <Cartao suave style={{ alignItems: 'center', paddingVertical: 22 }}>
        <Retrato preferencias={draft} tamanho={104} />
      </Cartao>

      <Cartao>
        <Texto variante="secao">Escolha um retrato</Texto>
        <View style={opcoes}>
          {retratos.map(({ nome }, indice) => (
            <Pressable key={nome} accessibilityRole="radio" accessibilityLabel={nome}
              accessibilityState={{ checked: draft.retrato === indice, disabled: ocupado }}
              onPress={() => atualizar({ retrato: indice })} disabled={ocupado}
              style={[
                estilos.retrato,
                { borderColor: draft.retrato === indice ? paleta.destaque : 'transparent' },
              ]}>
              <Retrato preferencias={{ ...draft, retrato: indice }} tamanho={52} />
              <Texto variante="nota">{nome}</Texto>
            </Pressable>
          ))}
        </View>
      </Cartao>

      <Cartao>
        <Texto variante="secao">Fundo do avatar</Texto>
        <View style={opcoes}>
          {fundosAvatar.map(({ nome }, indice) => (
            <Opcao key={nome} titulo={nome} ativa={draft.fundoAvatar === indice}
              desabilitada={ocupado} onPress={() => atualizar({ fundoAvatar: indice })} />
          ))}
        </View>
      </Cartao>

      <Botao titulo="Salvar avatar" desabilitado={ocupado}
        onPress={() => salvar({ retrato: draft.retrato, fundoAvatar: draft.fundoAvatar })} />
      <Link titulo="Retratos por AB Design · Flaticon"
        onPress={() => Linking.openURL('https://www.flaticon.com/authors/ab-design').catch(() => {
          Alert.alert('Não foi possível abrir o site.');
        })} />
    </Tela>
  );
}

export function EditarHumoresScreen({ navigation }) {
  const { paleta } = useEntrelinhas();
  const { draft, atualizar, salvar, ocupado } = useEdicao(navigation);

  function mudar(campo, id, valor) {
    atualizar({ [campo]: { ...draft[campo], [id]: valor } });
  }

  return (
    <Tela titulo="Meus humores" descricao="Escolha os rótulos e as cores que fazem sentido para você."
      menu={false} teclado voltar={() => navigation.goBack()}>
      {humores.map((item) => (
        <Cartao key={item.id}>
          <AvatarHumor humor={{ ...item, cor: draft.coresHumores[item.id] || item.cor }} tamanho={48} />
          <CampoTexto
            rotulo={'Nome para ' + item.nome} placeholder={item.nome}
            value={draft.rotulos[item.id] ?? item.nome} maxLength={18} editable={!ocupado}
            onChangeText={(valor) => mudar('rotulos', item.id, valor)}
          />
          <View style={opcoes}>
            {humores.map(({ id, nome, cor }) => (
              <Pressable key={id} accessibilityRole="radio" accessibilityLabel={'Cor de ' + nome}
                accessibilityState={{ checked: (draft.coresHumores[item.id] || item.cor) === cor }}
                disabled={ocupado} onPress={() => mudar('coresHumores', item.id, cor)}
                style={[estilos.cor, {
                  backgroundColor: cor,
                  borderColor: (draft.coresHumores[item.id] || item.cor) === cor ? paleta.destaque : 'transparent',
                }]} />
            ))}
          </View>
        </Cartao>
      ))}
      <Botao titulo="Salvar humores" onPress={() => salvar({ rotulos: draft.rotulos, coresHumores: draft.coresHumores })}
        desabilitado={ocupado} />
      <Botao titulo="Restaurar padrão" onPress={() => atualizar({ rotulos: {}, coresHumores: {} })}
        desabilitado={ocupado} secundario />
    </Tela>
  );
}

export function EditarAtividadesScreen({ navigation }) {
  const { draft, salvar, ocupado } = useEdicao(navigation);
  const [grupos, setGrupos] = useState(() => draft.grupos.map(({ nome, opcoes: itens }) => ({
    nome, texto: itens.join('\n'),
  })));

  function alterar(indice, campo, valor) {
    setGrupos((atuais) => atuais.map((grupo, i) => i === indice ? { ...grupo, [campo]: valor } : grupo));
  }

  function confirmar() {
    if (grupos.some(({ nome }) => !nome.trim())) {
      Alert.alert('Dê um nome a cada grupo.');
      return;
    }
    salvar({ grupos: grupos.map(({ nome, texto }) => ({
      nome: nome.trim(),
      opcoes: [...new Set(texto.split('\n').map((item) => item.trim()).filter(Boolean))]
        .slice(0, 16).map((item) => item.slice(0, 40)),
    })) });
  }

  return (
    <Tela titulo="Minhas atividades" descricao="Organize os contextos que aparecem durante o registro."
      menu={false} teclado voltar={() => navigation.goBack()}>
      {grupos.map((grupo, indice) => (
        <Cartao key={indice}>
          <CampoTexto rotulo="Nome do grupo" value={grupo.nome} maxLength={30} editable={!ocupado}
            onChangeText={(texto) => alterar(indice, 'nome', texto)} />
          <CampoTexto rotulo="Uma atividade por linha" value={grupo.texto} multiline maxLength={650}
            editable={!ocupado} onChangeText={(texto) => alterar(indice, 'texto', texto)} />
          <Link titulo="Remover grupo" desabilitado={ocupado}
            onPress={() => setGrupos((atuais) => atuais.filter((_, i) => i !== indice))} />
        </Cartao>
      ))}
      <Botao titulo="Adicionar grupo" desabilitado={ocupado || grupos.length >= 12}
        onPress={() => setGrupos((atuais) => [...atuais, { nome: '', texto: '' }])} secundario />
      <Botao titulo="Salvar atividades" onPress={confirmar} desabilitado={ocupado} />
      <Link titulo="Restaurar atividades padrão" desabilitado={ocupado}
        onPress={() => setGrupos(atividades.map(({ nome, opcoes: itens }) => ({ nome, texto: itens.join('\n') })))} />
    </Tela>
  );
}

export function TemaOrganizacaoScreen({ navigation }) {
  const { draft, atualizar, salvar, ocupado } = useEdicao(navigation);

  function mover(indice, diferenca) {
    const novaOrdem = [...draft.ordem];
    [novaOrdem[indice], novaOrdem[indice + diferenca]] = [novaOrdem[indice + diferenca], novaOrdem[indice]];
    atualizar({ ordem: novaOrdem });
  }

  return (
    <Tela titulo="Tema e organização" menu={false} voltar={() => navigation.goBack()}>
      <Cartao>
        <Texto variante="secao">Tema</Texto>
        <View style={opcoes}>
          <Opcao titulo="Claro" ativa={draft.tema === 'claro'}
            onPress={() => atualizar({ tema: 'claro' })} desabilitada={ocupado} />
          <Opcao titulo="Escuro" ativa={draft.tema === 'escuro'}
            onPress={() => atualizar({ tema: 'escuro' })} desabilitada={ocupado} />
        </View>
      </Cartao>

      <Cartao>
        <Texto variante="secao">Ordem no Início</Texto>
        {draft.ordem.map((id, indice) => (
          <View key={id} style={linha}>
            <Texto style={{ flex: 1 }}>{modulosInicio.find((item) => item.id === id)?.nome}</Texto>
            <Link titulo="Subir" desabilitado={ocupado || indice === 0} onPress={() => mover(indice, -1)} />
            <Link titulo="Descer" desabilitado={ocupado || indice === draft.ordem.length - 1}
              onPress={() => mover(indice, 1)} />
          </View>
        ))}
      </Cartao>

      <Botao titulo="Salvar aparência" desabilitado={ocupado}
        onPress={() => salvar({ tema: draft.tema, ordem: draft.ordem })} />
    </Tela>
  );
}

export function AcessibilidadeScreen({ navigation }) {
  const { draft, atualizar, salvar, ocupado } = useEdicao(navigation);
  const opcoesAcesso = [
    ['Fonte maior', 'fonteMaior'],
    ['Contraste reforçado', 'contraste'],
    ['Reduzir movimento', 'reduzirMovimento'],
  ];

  return (
    <Tela titulo="Acessibilidade" menu={false} voltar={() => navigation.goBack()}>
      <Cartao>
        {opcoesAcesso.map(([titulo, campo]) => (
          <Opcao key={campo} titulo={titulo} ativa={draft[campo]}
            desabilitada={ocupado} onPress={() => atualizar({ [campo]: !draft[campo] })} />
        ))}
      </Cartao>

      <Botao titulo="Salvar acessibilidade" desabilitado={ocupado}
        onPress={() => salvar({
          fonteMaior: draft.fonteMaior, contraste: draft.contraste, reduzirMovimento: draft.reduzirMovimento,
        })} />
    </Tela>
  );
}

export function PrivacidadeScreen({ navigation }) {
  const { apagarConta, onSair } = useEntrelinhas();
  const [ocupado, setOcupado] = useState(false);
  const emCurso = useRef(false);

  function confirmar() {
    Alert.alert('Excluir sua conta?', 'A conta e os registros serão apagados do servidor.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir conta', style: 'destructive', onPress: async () => {
        if (emCurso.current) return;
        emCurso.current = true;
        setOcupado(true);
        try {
          await apagarConta();
        } catch (erro) {
          if (erro.status === 401) onSair();
          else Alert.alert('Não foi possível confirmar a exclusão', erro.message);
        } finally {
          emCurso.current = false;
          setOcupado(false);
        }
      } },
    ]);
  }

  return (
    <Tela titulo="Privacidade e dados" menu={false} voltar={() => navigation.goBack()}>
      <PoliticaPrivacidade />
      <Botao titulo="Exportar meus dados" desabilitado={ocupado}
        onPress={() => navigation.popTo('Menu', { screen: 'Historico', params: { exportar: true } })} />
      <Link titulo="Excluir minha conta" onPress={confirmar} desabilitado={ocupado} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: 0, paddingVertical: 4 },
  item: { ...linha, minHeight: 57, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  icone: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  retrato: { alignItems: 'center', padding: 6, borderWidth: 1, borderRadius: 13, gap: 5 },
  cor: { width: 46, height: 46, borderRadius: 23, borderWidth: 2 },
});