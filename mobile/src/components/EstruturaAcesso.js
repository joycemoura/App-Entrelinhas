import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { cores } from '../constants/tema';

export default function EstruturaAcesso({ chamada, titulo, descricao, ilustracao = false, onVoltar, children }) {
  const Rolagem = Platform.OS === 'web' ? ScrollView : KeyboardAwareScrollView;

  return (
    <SafeAreaView style={styles.tela}>
      <Rolagem {...(Platform.OS !== 'web' ? { bottomOffset: 24 } : {})} style={styles.tela} contentContainerStyle={styles.rolagem} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.conteudo}>
          <View style={styles.cabecalho}>
            <Text style={styles.marca}>entrelinhas.</Text>
          </View>
          {onVoltar && (
            <Pressable onPress={onVoltar} accessibilityRole="button" accessibilityLabel="Voltar para o login" style={styles.voltar}>
              <Text style={styles.textoVoltar}>‹  Voltar</Text>
            </Pressable>
          )}
          {ilustracao && (
            <View style={styles.ilustracao} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={styles.simbolo}>≋</Text>
            </View>
          )}
          <View style={styles.apresentacao}>
            <Text style={styles.chamada}>{chamada}</Text>
            <Text accessibilityRole="header" style={styles.titulo}>{titulo}</Text>
            <Text style={styles.descricao}>{descricao}</Text>
          </View>
          {children}
        </View>
      </Rolagem>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 },
  conteudo: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingBottom: 20 },
  cabecalho: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  marca: { color: cores.texto, fontSize: 24, fontWeight: '700', letterSpacing: -1 },
  voltar: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingRight: 16, marginBottom: 16 },
  textoVoltar: { color: cores.textoSecundario, fontSize: 16 },
  ilustracao: { width: 96, height: 96, borderRadius: 48, backgroundColor: cores.superficieSuave, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 12 },
  simbolo: { color: '#82715A', fontSize: 58, lineHeight: 72 },
  apresentacao: { gap: 12, marginTop: 8, marginBottom: 24 },
  chamada: { color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  titulo: { color: cores.texto, fontSize: 38, lineHeight: 44, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  descricao: { color: cores.textoSecundario, fontSize: 16, lineHeight: 25 },
});