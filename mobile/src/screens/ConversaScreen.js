import { useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { Aviso, Cartao, Link, Tela, Texto } from '../components/Interface';
import { perguntarIa } from '../services/iagen';
import { useEntrelinhas } from '../state/Entrelinhas';

export default function ConversaScreen({ route, navigation }) {
  const { registros, mensagens, setMensagens, meusHumores, preferencias } = useEntrelinhas();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const rolagem = useRef(null);
  const pedidoAtual = useRef(null);
  const registro = registros.find((item) => item.id === route.params?.registroId);
  const humor = meusHumores.find((item) => item.id === registro?.humor);

  useEffect(() => () => pedidoAtual.current?.abort(), []);

  async function enviar() {
    const pergunta = texto.trim();
    if (pergunta.length < 3 || pedidoAtual.current) return;

    const pedido = new AbortController();
    pedidoAtual.current = pedido;
    setEnviando(true);
    setErro('');
    Keyboard.dismiss();

    try {
      const resposta = await perguntarIa(pergunta, pedido.signal);
      if (pedido.signal.aborted) return;
      setTexto('');
      setMensagens((atuais) => [...atuais, { pessoa: true, mensagem: pergunta }, { pessoa: false, ...resposta }]);
      requestAnimationFrame(() => rolagem.current?.scrollToEnd({ animated: !preferencias.reduzirMovimento }));
    } catch (falha) {
      if (!pedido.signal.aborted) setErro(falha.message);
    } finally {
      pedidoAtual.current = null;
      if (!pedido.signal.aborted) setEnviando(false);
    }
  }

  return (
    <Tela
      titulo="Conversa com IA"
      descricao="Faça uma pergunta sobre os documentos de referência."
      menu={false}
      voltar={() => navigation.goBack()}
      teclado
      scrollRef={rolagem}
    >
      {humor && (
        <Cartao suave>
          <Texto variante="secao">Seu ponto de partida</Texto>
          <Texto>Humor selecionado no diário: {humor.nome}. Essa referência fica nesta tela.</Texto>
          <Link titulo="Remover referência" onPress={() => navigation.setParams({ registroId: null })} />
        </Cartao>
      )}

      {mensagens.map(({ pessoa, mensagem, fontes = [] }, indice) => (
        <Cartao key={indice} suave={pessoa}>
          <Texto variante="nota">{pessoa ? 'Você' : 'Assistente do Entrelinhas'}</Texto>
          <Texto>{mensagem}</Texto>
          {fontes.length > 0 && <Texto variante="nota">Fontes · {fontes.join(' e ')}</Texto>}
        </Cartao>
      ))}

      <CampoTexto rotulo="Sua pergunta" value={texto} onChangeText={setTexto} maxLength={500} editable={!enviando} multiline
        ajuda="A pergunta é enviada ao Gemini. Use exemplos fictícios e deixe dados pessoais ou de saúde fora da conversa." />
      {Boolean(erro) && <Aviso erro>{erro}</Aviso>}
      <Botao titulo={enviando ? 'Consultando documentos...' : 'Enviar'} onPress={enviar}
        desabilitado={enviando || texto.trim().length < 3} />

      {mensagens.length > 0 && (
        <Link titulo="Limpar conversa" onPress={() => setMensagens([])} desabilitado={enviando} />
      )}
    </Tela>
  );
}