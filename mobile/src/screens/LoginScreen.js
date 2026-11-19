import { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import EstruturaAcesso from '../components/EstruturaAcesso';
import { cores } from '../constants/tema';
import { fazerLogin } from '../services/api';

export default function LoginScreen({ navigation, onEntrar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tocados, setTocados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const envioEmCurso = useRef(false);

  const emailLimpo = email.trim();
  const erroEmail = !emailLimpo
    ? 'Informe seu e-mail.'
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)
      ? ''
      : 'Confira o endereço de e-mail.';
  const erroSenha = !senha ? 'Informe sua senha.' : '';

  function tocar(campo) {
    setTocados((anteriores) => ({ ...anteriores, [campo]: true }));
  }

  async function entrar() {
    if (envioEmCurso.current) return;

    setTocados({ email: true, senha: true });

    if (erroEmail || erroSenha) return;

    envioEmCurso.current = true;
    setEnviando(true);
    Keyboard.dismiss();

    try {
      const { token, usuario, expiraEm } = await fazerLogin(emailLimpo, senha);

      if (
        typeof token !== 'string' ||
        !token ||
        typeof usuario?.nome !== 'string' ||
        !Number.isFinite(expiraEm) ||
        expiraEm <= 0
      ) {
        throw new Error('A API retornou dados de login incompletos.');
      }

      if (navigation.isFocused()) {
        setSenha('');
        setTocados({});
        await onEntrar({ token, usuario, expiraEm });
      }
    } catch (erro) {
      if (navigation.isFocused()) {
        Alert.alert('Não foi possível entrar', erro.message);
      }
    } finally {
      envioEmCurso.current = false;
      setEnviando(false);
    }
  }

  function abrirCadastro() {
    if (envioEmCurso.current) return;

    Keyboard.dismiss();
    setSenha('');
    setTocados({});
    navigation.navigate('Cadastro');
  }

  return (
    <EstruturaAcesso
      chamada="BOM TER VOCÊ AQUI"
      titulo={'Um momento\npara você.'}
      descricao="Entre para continuar se escutando, no seu tempo."
      ilustracao
    >
      <View style={styles.formulario}>
        <CampoTexto
          rotulo="E-mail"
          placeholder="voce@exemplo.com"
          value={email}
          onChangeText={setEmail}
          onBlur={() => tocar('email')}
          erro={tocados.email ? erroEmail : ''}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!enviando}
        />

        <CampoTexto
          rotulo="Senha"
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
          onBlur={() => tocar('senha')}
          erro={tocados.senha ? erroSenha : ''}
          autoCapitalize="none"
          autoComplete="current-password"
          returnKeyType="done"
          onSubmitEditing={entrar}
          editable={!enviando}
          senha
        />
      </View>

      <Pressable
        onPress={() => {
          Alert.alert(
            'Recuperação de senha',
            'A recuperação por e-mail ainda não está disponível.'
          );
        }}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityState={{ disabled: enviando }}
        style={styles.recuperar}
      >
        <Text style={styles.link}>Esqueceu sua senha?</Text>
      </Pressable>

      <Botao
        titulo={enviando ? 'Entrando...' : 'Entrar'}
        onPress={entrar}
        desabilitado={enviando}
      />

      <View style={styles.criarConta}>
        <Text style={styles.texto}>Primeira vez por aqui?</Text>

        <Pressable
          onPress={abrirCadastro}
          disabled={enviando}
          accessibilityRole="button"
          accessibilityState={{ disabled: enviando }}
          style={styles.linkToque}
        >
          <Text style={styles.link}>Criar conta</Text>
        </Pressable>
      </View>
    </EstruturaAcesso>
  );
}

const styles = StyleSheet.create({
  formulario: {
    gap: 20,
  },
  recuperar: {
    minHeight: 48,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
    paddingRight: 12,
  },
  link: {
    color: cores.destaque,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  criarConta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  texto: {
    color: cores.textoSecundario,
    fontSize: 14,
  },
  linkToque: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});