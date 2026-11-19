import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { cores } from '../constants/tema';
import { useEntrelinhas } from '../state/Entrelinhas';

export default function CampoTexto({
  rotulo, ajuda, erro, senha = false, onFocus, onBlur, style, ...propriedades
}) {
  const { paleta = cores, escala = 1 } = useEntrelinhas() ?? {};
  const [emFoco, setEmFoco] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const borda = erro ? paleta.erro : emFoco ? paleta.destaque : paleta.borda;
  const acaoSenha = mostrarSenha ? 'Ocultar' : 'Mostrar';

  return (
    <View style={estilos.grupo}>
      <Text style={{ color: paleta.texto, fontSize: 15 * escala, fontWeight: '600' }}>{rotulo}</Text>

      <View style={[estilos.contorno, { borderColor: borda, backgroundColor: paleta.superficie }]}>
        <TextInput
          autoCorrect={false}
          {...propriedades}
          style={[
            estilos.campo,
            { color: paleta.texto, fontSize: 16 * escala },
            propriedades.multiline && estilos.multilinha,
            style,
          ]}
          accessibilityLabel={rotulo}
          accessibilityHint={erro || ajuda}
          placeholderTextColor={paleta.textoSecundario}
          selectionColor={paleta.acao}
          underlineColorAndroid="transparent"
          secureTextEntry={senha && !mostrarSenha}
          onFocus={(evento) => { setEmFoco(true); onFocus?.(evento); }}
          onBlur={(evento) => { setEmFoco(false); onBlur?.(evento); }}
        />

        {senha && (
          <Pressable
            onPress={() => setMostrarSenha((anterior) => !anterior)}
            accessibilityRole="button"
            accessibilityLabel={`${acaoSenha} senha`}
            disabled={propriedades.editable === false}
            style={estilos.alternarSenha}
          >
            <Text style={{ color: paleta.destaque, fontSize: 13 * escala }}>{acaoSenha}</Text>
          </Pressable>
        )}
      </View>

      {Boolean(erro || ajuda) && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: erro ? paleta.erro : paleta.textoSecundario, fontSize: 14 * escala }}
        >
          {erro || ajuda}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: 8 },
  contorno: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
  },
  campo: { flex: 1, minWidth: 0, paddingHorizontal: 16, paddingVertical: 14 },
  multilinha: { minHeight: 96, textAlignVertical: 'top' },
  alternarSenha: { minHeight: 48, minWidth: 64, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
});