import { Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../constants/tema';
import { useEntrelinhas } from '../state/Entrelinhas';

export default function Botao({ titulo, onPress, secundario = false, desabilitado = false }) {
  const { paleta = cores, escala = 1 } = useEntrelinhas() ?? {};

  const fundo = desabilitado
    ? paleta.desabilitado
    : secundario ? paleta.superficie : paleta.acao;
  const texto = desabilitado
    ? paleta.textoDesabilitado
    : secundario ? paleta.destaque : paleta.textoSobreAcao;

  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: fundo, borderColor: secundario ? paleta.borda : fundo },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[estilos.texto, { color: texto, fontSize: 16 * escala }]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontWeight: '700', textAlign: 'center' },
});