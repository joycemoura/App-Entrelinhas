import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Botao from '../components/Botao';
import EstruturaAcesso from '../components/EstruturaAcesso';
import { Cartao, Texto } from '../components/Interface';
import { cores } from '../constants/tema';

const secoes = [
  {
    titulo: 'Para que serve',
    texto: 'O Entrelinhas é um diário de humor. Seus registros ajudam você a acompanhar como se sentiu ao longo do tempo.',
  },
  {
    titulo: 'Dados da conta',
    texto: 'O cadastro usa nome ou apelido, e-mail e senha. O telefone é opcional.',
  },
  {
    titulo: 'Seus registros',
    texto: 'O humor e as anotações podem conter informações sensíveis. Eles ficam no banco de dados do aplicativo, vinculados à sua conta.',
  },
  {
    titulo: 'Suas escolhas',
    texto: 'No Calendário, você pode consultar e apagar seus registros. Em Privacidade e dados, você pode exportar seus dados em PDF. O aceite e as preferências ficam no aparelho. Na conversa com IA, a pergunta digitada é enviada à API do Entrelinhas e ao Gemini. Guarde as anotações pessoais no diário. As mensagens ficam na memória da sessão do app.',
  },
];

const textoAceite = 'Li e aceito os termos de privacidade e o armazenamento dos meus registros.';

export function PoliticaPrivacidade() {
  return (
    <Cartao>
      {secoes.map(({ titulo, texto }) => (
        <View key={titulo} style={estilos.secao}>
          <Texto accessibilityRole="header" variante="secao">
            {titulo}
          </Texto>
          <Texto>{texto}</Texto>
        </View>
      ))}
    </Cartao>
  );
}

export default function TermosScreen({ aposCadastro, onAceitar, onVoltar, salvando = false }) {
  const [marcado, setMarcado] = useState(false);

  return (
    <EstruturaAcesso
      chamada={aposCadastro ? 'CONTA CRIADA' : 'ANTES DE COMEÇAR'}
      titulo="Termos de privacidade"
      descricao={aposCadastro
        ? 'Seu cadastro foi concluído. Leia os termos antes de voltar ao login.'
        : 'Leia os termos antes de acessar o diário.'}
      onVoltar={salvando ? undefined : onVoltar}
    >
      <View style={estilos.conteudo}>
        <PoliticaPrivacidade />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={textoAceite}
          accessibilityState={{ checked: marcado, disabled: salvando }}
          disabled={salvando}
          onPress={() => setMarcado((anterior) => !anterior)}
          style={estilos.aceite}
        >
          <View style={[estilos.caixa, marcado && estilos.caixaMarcada]}>
            {marcado && <Text style={estilos.marca}>✓</Text>}
          </View>
          <Text style={[estilos.texto, estilos.rotulo]}>
            {textoAceite}
          </Text>
        </Pressable>

        <Botao
          titulo={salvando ? 'Salvando...' : 'Aceitar e continuar'}
          onPress={onAceitar}
          desabilitado={!marcado || salvando}
        />
      </View>
    </EstruturaAcesso>
  );
}

const estilos = StyleSheet.create({
  conteudo: { gap: 18 },
  secao: { gap: 4 },
  texto: { color: cores.texto, fontSize: 15, lineHeight: 22 },
  aceite: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  caixa: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: cores.destaque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: { backgroundColor: cores.acao },
  marca: { color: cores.textoSobreAcao, fontWeight: '700' },
  rotulo: { flex: 1 },
});