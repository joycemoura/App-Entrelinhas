import { useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, View } from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import EstruturaAcesso from '../components/EstruturaAcesso';
import { cadastrarUsuario } from '../services/api';

export default function CadastroScreen({ navigation, onCadastrado }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tocados, setTocados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const envioEmCurso = useRef(false);

  const digitosTelefone = telefone.replace(/\D/g, '');
  const erros = {
    nome: nome.trim() ? '' : 'Informe seu nome ou apelido.',
    email: !email.trim()
      ? 'Informe seu e-mail.'
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? ''
        : 'Confira o endereço de e-mail.',
    telefone: !telefone.trim() || /^\d{10,11}$/.test(digitosTelefone)
      ? ''
      : 'Informe o DDD e o número, ou deixe em branco.',
    senha: !senha
      ? 'Crie uma senha.'
      : senha.length < 8
        ? 'Use pelo menos 8 caracteres.'
        : '',
    confirmacao: !confirmacao
      ? 'Repita a senha.'
      : confirmacao !== senha
        ? 'As senhas estão diferentes.'
        : '',
  };

  function tocar(campo) {
    setTocados((anteriores) => ({ ...anteriores, [campo]: true }));
  }

  async function cadastrar() {
    if (envioEmCurso.current) return;

    setTocados({
      nome: true,
      email: true,
      telefone: true,
      senha: true,
      confirmacao: true,
    });

    if (Object.values(erros).some(Boolean)) return;

    envioEmCurso.current = true;
    setEnviando(true);
    Keyboard.dismiss();

    try {
      const { usuario } = await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        senha,
      });

      if (!navigation.isFocused()) return;

      setSenha('');
      setConfirmacao('');

      if (Number.isInteger(usuario?.id) && usuario.id > 0) {
        onCadastrado(usuario.id);
      } else {
        Alert.alert('Conta criada', 'Entre com sua conta para continuar.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (erro) {
      if (navigation.isFocused()) {
        const detalhes = Object.values(erro.campos ?? {}).join('\n');
        Alert.alert('Não foi possível criar a conta', detalhes || erro.message);
      }
    } finally {
      envioEmCurso.current = false;
      setEnviando(false);
    }
  }

  return (
    <EstruturaAcesso
      chamada="UM COMEÇO, DO SEU JEITO"
      titulo="Crie seu espaço."
      descricao="Como você quer começar sua história por aqui?"
      onVoltar={() => navigation.goBack()}
    >
      <View style={styles.formulario}>
        <CampoTexto
          rotulo="Nome ou apelido"
          placeholder="Como quer que a gente chame você?"
          value={nome}
          onChangeText={setNome}
          onBlur={() => tocar('nome')}
          erro={tocados.nome ? erros.nome : ''}
          autoComplete="name"
          autoCapitalize="words"
          editable={!enviando}
        />

        <CampoTexto
          rotulo="E-mail"
          placeholder="voce@exemplo.com"
          value={email}
          onChangeText={setEmail}
          onBlur={() => tocar('email')}
          erro={tocados.email ? erros.email : ''}
          autoComplete="email"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!enviando}
        />

        <CampoTexto
          rotulo="Telefone (opcional)"
          placeholder="(44) 99999-9999"
          value={telefone}
          onChangeText={setTelefone}
          onBlur={() => tocar('telefone')}
          erro={tocados.telefone ? erros.telefone : ''}
          autoComplete="tel"
          keyboardType="phone-pad"
          editable={!enviando}
        />

        <CampoTexto
          rotulo="Senha"
          placeholder="Crie uma senha"
          ajuda="Use pelo menos 8 caracteres."
          value={senha}
          onChangeText={setSenha}
          onBlur={() => tocar('senha')}
          erro={tocados.senha ? erros.senha : ''}
          autoComplete="new-password"
          autoCapitalize="none"
          editable={!enviando}
          senha
        />

        <CampoTexto
          rotulo="Confirme sua senha"
          placeholder="Digite a senha novamente"
          value={confirmacao}
          onChangeText={setConfirmacao}
          onBlur={() => tocar('confirmacao')}
          erro={tocados.confirmacao ? erros.confirmacao : ''}
          autoComplete="new-password"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={cadastrar}
          editable={!enviando}
          senha
        />
      </View>

      <Botao
        titulo={enviando ? 'Criando conta...' : 'Criar conta'}
        onPress={cadastrar}
        desabilitado={enviando}
      />
    </EstruturaAcesso>
  );
}

const styles = StyleSheet.create({
  formulario: {
    gap: 20,
    marginBottom: 24,
  },
});