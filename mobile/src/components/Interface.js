import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEntrelinhas } from '../state/Entrelinhas';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Ionicons from '@expo/vector-icons/Ionicons';

export { AvatarHumor, Retrato } from './Avatares';

export function Texto({ children, variante = 'corpo', style, ...props }) {
  const { paleta, escala } = useEntrelinhas();
  const tamanhos = { titulo: 29, editorial: 36, secao: 18, corpo: 16, nota: 14 };
  return (
    <Text
      {...props}
      style={[
        { color: variante === 'nota' ? paleta.textoSecundario : paleta.texto, fontSize: tamanhos[variante] * escala },
        variante === 'titulo' && estilos.titulo,
        variante === 'editorial' && estilos.editorial,
        variante === 'secao' && estilos.secao,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Tela({ titulo, descricao, menu = true, teclado = false, voltar, children, scrollRef, ...rolagem }) {
  const { paleta } = useEntrelinhas();
  const Rolagem = teclado && Platform.OS !== 'web' ? KeyboardAwareScrollView : ScrollView;

  return (
    <SafeAreaView
      edges={menu ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
      style={[estilos.tela, { backgroundColor: paleta.fundo }]}
    >
      <Rolagem
        {...(Rolagem === KeyboardAwareScrollView ? { bottomOffset: 24 } : {})}
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={estilos.rolagem}
        {...rolagem}
      >
        <View style={estilos.conteudo}>
          {voltar && (
            <Pressable onPress={voltar} accessibilityRole="button" style={estilos.voltar}>
              <Ionicons name="chevron-back" size={18} color={paleta.destaque} />
              <Texto variante="nota" style={{ color: paleta.destaque }}>Voltar</Texto>
            </Pressable>
          )}
          {Boolean(titulo) && <View style={estilos.cabecalho}>
            <Texto variante="titulo" accessibilityRole="header">{titulo}</Texto>
            {descricao && <Texto variante="nota" style={estilos.descricao}>{descricao}</Texto>}
          </View>}
          {children}
        </View>
      </Rolagem>
    </SafeAreaView>
  );
}

export function Cartao({ children, style, suave = false }) {
  const { paleta } = useEntrelinhas();
  return (
    <View style={[
      estilos.cartao,
      { backgroundColor: suave ? paleta.superficieSuave : paleta.superficie, borderColor: paleta.borda + '70' },
      style,
    ]}>
      {children}
    </View>
  );
}

export function Link({ titulo, onPress, desabilitado = false }) {
  const { paleta } = useEntrelinhas();
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      style={estilos.link}
    >
      <Texto style={{ color: desabilitado ? paleta.textoSecundario : paleta.destaque, fontWeight: '700' }}>
        {titulo}
      </Texto>
    </Pressable>
  );
}

export function Opcao({ titulo, ativa, onPress, desabilitada = false }) {
  const { paleta } = useEntrelinhas();
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitada}
      accessibilityRole="button"
      accessibilityState={{ selected: ativa, disabled: desabilitada }}
      style={[
        estilos.opcao,
        { backgroundColor: ativa ? paleta.superficieSuave : paleta.superficie, borderColor: ativa ? paleta.destaque : paleta.borda },
      ]}
    >
      <Texto variante="nota" style={{ fontWeight: ativa ? '700' : '500' }}>
        {ativa ? '✓ ' : ''}{titulo}
      </Texto>
    </Pressable>
  );
}

export function Aviso({ children, erro = false }) {
  const { paleta } = useEntrelinhas();
  return (
    <Texto
      accessibilityLiveRegion="polite"
      variante="nota"
      style={{ color: erro ? paleta.erro : paleta.texto }}
    >
      {children}
    </Texto>
  );
}

export const linha = { flexDirection: 'row', alignItems: 'center', gap: 10 };
export const opcoes = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 };

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  rolagem: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  conteudo: { width: '100%', maxWidth: 550, alignSelf: 'center', gap: 18 },
  cabecalho: { gap: 6, paddingBottom: 2 },
  descricao: { lineHeight: 21 },
  titulo: { fontWeight: '700', letterSpacing: -0.65 },
  editorial: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', letterSpacing: -0.6 },
  voltar: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3, paddingRight: 12 },
  secao: { fontWeight: '700' },
  cartao: { padding: 16, borderWidth: 1, borderRadius: 22, gap: 12 },
  link: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingRight: 10 },
  opcao: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center', borderRadius: 16, borderWidth: 1 },
});