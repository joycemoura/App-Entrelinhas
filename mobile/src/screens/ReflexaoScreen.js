import { useState } from 'react';
import { Keyboard } from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { Cartao, Link, Tela, Texto } from '../components/Interface';

const perguntas = [
  'O que fez diferença no seu dia?',
  'Qual sentimento você percebeu com mais clareza hoje?',
  'Que detalhe você gostaria de guardar deste momento?',
];

export default function ReflexaoScreen({ navigation }) {
  const [pergunta, setPergunta] = useState(0);
  const [texto, setTexto] = useState('');

  function levarAoRegistro() {
    Keyboard.dismiss();
    navigation.navigate('Diario', { anotacao: texto.trim() });
  }

  return (
    <Tela titulo="Reflexão" menu={false} teclado voltar={() => navigation.goBack()}>
      <Cartao suave>
        <Texto variante="editorial">{perguntas[pergunta]}</Texto>
        <Link titulo="Trocar pergunta"
          onPress={() => setPergunta((atual) => (atual + 1) % perguntas.length)} />
      </Cartao>

      <Cartao>
        <CampoTexto rotulo="Sua reflexão" value={texto} onChangeText={setTexto}
          multiline maxLength={2000} />
        <Texto variante="nota">Use sua reflexão como nota ao criar um registro.</Texto>
      </Cartao>
      <Botao titulo="Usar no meu registro" onPress={levarAoRegistro} desabilitado={!texto.trim()} />
    </Tela>
  );
}