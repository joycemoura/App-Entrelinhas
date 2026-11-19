import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Fragment } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { versaoTermos } from './src/constants/prototipo';
import CadastroScreen from './src/screens/CadastroScreen';
import {
  AcessibilidadeScreen, ConfiguracoesScreen, EditarAtividadesScreen, EditarHumoresScreen,
  MeuAvatarScreen, PrivacidadeScreen, TemaOrganizacaoScreen,
} from './src/screens/Configuracoes';
import ConversaScreen from './src/screens/ConversaScreen';
import FluxoRegistro from './src/screens/FluxoRegistro';
import HistoricoScreen, { EstatisticasScreen } from './src/screens/HistoricoScreen';
import InicioScreen from './src/screens/InicioScreen';
import LoginScreen from './src/screens/LoginScreen';
import LembretesScreen from './src/screens/LembretesScreen';
import PersonalizarEntrada from './src/screens/PersonalizarEntrada';
import ReflexaoScreen from './src/screens/ReflexaoScreen';
import TermosScreen from './src/screens/TermosScreen';
import { ProvedorEntrelinhas, useEntrelinhas } from './src/state/Entrelinhas';

const ProvedorTeclado = Platform.OS === 'web' ? Fragment : KeyboardProvider;
const Stack = createNativeStackNavigator();
const Abas = createBottomTabNavigator();
const icones = {
  Inicio: 'home-outline', Historico: 'calendar-outline', Registrar: 'add-circle',
  Estatisticas: 'bar-chart-outline', Configuracoes: 'settings-outline',
};

function chaveTermos(usuarioId) {
  return `entrelinhas/aceite/${usuarioId}`;
}

function AtalhoRegistro() {
  return null;
}

function MenuPrincipal() {
  const { paleta } = useEntrelinhas();

  return (
    <Abas.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: paleta.destaque,
        tabBarInactiveTintColor: paleta.textoSecundario,
        tabBarStyle: { backgroundColor: paleta.superficie, borderTopColor: paleta.borda },
        tabBarIcon: ({ color, size }) => <Ionicons name={icones[route.name]} color={color} size={size} />,
      })}
    >
      <Abas.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Abas.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Calendário' }} />
      <Abas.Screen
        name="Registrar" component={AtalhoRegistro}
        listeners={({ navigation }) => ({
          tabPress: (evento) => {
            evento.preventDefault();
            navigation.navigate('Diario');
          },
        })}
      />
      <Abas.Screen name="Estatisticas" component={EstatisticasScreen} options={{ title: 'Estatísticas' }} />
      <Abas.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Ajustes' }} />
    </Abas.Navigator>
  );
}

function Navegacao({ pendencia, aceitarTermos, voltarDosTermos, salvandoTermos, concluirCadastro, iniciarSessao }) {
  const { paleta, preferencias, preferenciasProntas, sessao } = useEntrelinhas();
  const escuro = preferencias.tema === 'escuro';
  const base = escuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...base,
    colors: {
      ...base.colors,
      primary: paleta.destaque, background: paleta.fundo, card: paleta.superficie,
      text: paleta.texto, border: paleta.borda, notification: paleta.acao,
    },
  };

  if (!preferenciasProntas) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: paleta.fundo }}>
        <ActivityIndicator accessibilityLabel="Carregando Entrelinhas" color={paleta.destaque} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <NavigationContainer theme={tema}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: preferencias.reduzirMovimento ? 'none' : 'default' }}>
          {pendencia ? (
            <Stack.Screen name="Termos">
              {() => (
                <TermosScreen
                  aposCadastro={!pendencia.sessao}
                  onAceitar={aceitarTermos}
                  onVoltar={voltarDosTermos}
                  salvando={salvandoTermos}
                />
              )}
            </Stack.Screen>
          ) : sessao && !preferencias.entradaConcluida ? (
            <Stack.Group navigationKey="personalizacao-inicial">
              <Stack.Screen name="ComoChamar" component={PersonalizarEntrada} />
              <Stack.Screen name="Objetivo" component={PersonalizarEntrada} />
              <Stack.Screen name="EscolherTema" component={PersonalizarEntrada} />
            </Stack.Group>
          ) : sessao ? (
            <Stack.Group navigationKey="area-do-usuario">
              <Stack.Screen name="Menu" component={MenuPrincipal} />
              <Stack.Screen name="Diario" component={FluxoRegistro} />
              <Stack.Screen name="Conversa" component={ConversaScreen} />
              <Stack.Screen name="Reflexao" component={ReflexaoScreen} />
              <Stack.Screen name="ComoChamar" component={PersonalizarEntrada} />
              <Stack.Screen name="Objetivo" component={PersonalizarEntrada} />
              <Stack.Screen name="EscolherTema" component={PersonalizarEntrada} />
              <Stack.Screen name="MeuAvatar" component={MeuAvatarScreen} />
              <Stack.Screen name="EditarHumores" component={EditarHumoresScreen} />
              <Stack.Screen name="EditarAtividades" component={EditarAtividadesScreen} />
              <Stack.Screen name="TemaOrganizacao" component={TemaOrganizacaoScreen} />
              <Stack.Screen name="Lembretes" component={LembretesScreen} />
              <Stack.Screen name="Acessibilidade" component={AcessibilidadeScreen} />
              <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
            </Stack.Group>
          ) : (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onEntrar={iniciarSessao} />}
              </Stack.Screen>
              <Stack.Screen name="Cadastro">
                {(props) => <CadastroScreen {...props} onCadastrado={concluirCadastro} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [pendencia, setPendencia] = useState(null);
  const [salvandoTermos, setSalvandoTermos] = useState(false);
  const aceiteEmCurso = useRef(false);

  function concluirCadastro(usuarioId) {
    setPendencia({ usuarioId });
  }

  function voltarDosTermos() {
    if (!aceiteEmCurso.current) setPendencia(null);
  }

  async function aceitarTermos() {
    if (!pendencia || aceiteEmCurso.current) return;
    aceiteEmCurso.current = true;
    setSalvandoTermos(true);

    try {
      await AsyncStorage.setItem(chaveTermos(pendencia.usuarioId), JSON.stringify({
        versao: versaoTermos,
        data: new Date().toISOString(),
      }));
      if (pendencia.sessao?.validoAte > Date.now()) setSessao(pendencia.sessao);
      setPendencia(null);
    } catch {
      Alert.alert('Não foi possível salvar o aceite', 'Tente novamente.');
    } finally {
      aceiteEmCurso.current = false;
      setSalvandoTermos(false);
    }
  }

  async function iniciarSessao({ token, usuario, expiraEm }) {
    if (!Number.isInteger(usuario.id) || usuario.id < 1) {
      throw new Error('A API retornou uma conta sem identificador válido.');
    }
    const novaSessao = { token, usuario, validoAte: Date.now() + expiraEm * 1000 };
    const aceite = await AsyncStorage.getItem(chaveTermos(usuario.id))
      .then((valor) => JSON.parse(valor))
      .catch(() => null);

    if (aceite?.versao === versaoTermos && aceite.data) {
      setSessao(novaSessao);
    } else {
      setPendencia({ usuarioId: usuario.id, sessao: novaSessao });
    }
  }

  const sair = useCallback(() => {
    setSessao((atual) => atual === sessao ? null : atual);
  }, [sessao]);

  useEffect(() => {
    if (!sessao) return;

    const temporizador = setTimeout(sair, Math.max(0, sessao.validoAte - Date.now()));
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && Date.now() >= sessao.validoAte) sair();
    });

    return () => {
      clearTimeout(temporizador);
      assinatura.remove();
    };
  }, [sessao, sair]);

  return (
    <SafeAreaProvider>
      <ProvedorTeclado>
        <ProvedorEntrelinhas key={sessao?.usuario.id ?? 'acesso'} sessao={sessao} onSair={sair}>
          <Navegacao
            pendencia={pendencia}
            aceitarTermos={aceitarTermos}
            voltarDosTermos={voltarDosTermos}
            salvandoTermos={salvandoTermos}
            concluirCadastro={concluirCadastro}
            iniciarSessao={iniciarSessao}
          />
        </ProvedorEntrelinhas>
      </ProvedorTeclado>
    </SafeAreaProvider>
  );
}