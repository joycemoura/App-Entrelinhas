import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, View } from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { Aviso, Cartao, Link, Opcao, Retrato, Tela, Texto, linha, opcoes } from '../components/Interface';
import { fundosAvatar, retratos } from '../constants/prototipo';
import { useEntrelinhas } from '../state/Entrelinhas';
import { lerHorario } from '../utils/datas';
import { PoliticaPrivacidade } from './TermosScreen';

const secoes = ['Aparência', 'Acessibilidade', 'Lembretes', 'Privacidade'];
const idLembrete = 'entrelinhas-lembrete-diario';

function Lembretes() {
  const [horario, setHorario] = useState('20:00');
  const [agendado, setAgendado] = useState('');
  const [ocupado, setOcupado] = useState(true);
  const [aviso, setAviso] = useState('');
  const emCurso = useRef(false);

  useEffect(() => {
    let ativo = true;

    import('expo-notifications')
      .then((modulo) => modulo.getAllScheduledNotificationsAsync())
      .then((lista) => {
        const lembrete = lista.find((item) => item.identifier === idLembrete);
        const horarioSalvo = lembrete?.content.data?.horario;
        if (ativo && horarioSalvo) {
          setAgendado(horarioSalvo);
          setHorario(horarioSalvo);
        }
      })
      .catch(() => { if (ativo) setAviso('Não foi possível consultar o lembrete.'); })
      .finally(() => { if (ativo) setOcupado(false); });

    return () => { ativo = false; };
  }, []);

  async function alterar(ativar) {
    if (ocupado || emCurso.current) return;
    const horarioLido = lerHorario(horario);

    if (ativar && !horarioLido) {
      setAviso('Informe um horário no formato HH:MM.');
      return;
    }

    emCurso.current = true;
    setOcupado(true);
    setAviso('');
    Keyboard.dismiss();

    try {
      const notificacoes = await import('expo-notifications');
      if (!ativar) {
        await notificacoes.cancelScheduledNotificationAsync(idLembrete);
        setAgendado('');
        return;
      }

      if (Platform.OS === 'android') {
        await notificacoes.setNotificationChannelAsync(idLembrete, {
          name: 'Lembretes do Entrelinhas',
          importance: notificacoes.AndroidImportance.DEFAULT,
        });
      }

      const permissao = await notificacoes.requestPermissionsAsync();
      if (!permissao.granted) {
        setAviso('Ative as notificações nos ajustes do aparelho.');
        return;
      }

      await notificacoes.scheduleNotificationAsync({
        identifier: idLembrete,
        content: {
          title: 'Entrelinhas',
          body: 'Reserve um momento para seu diário.',
          data: { horario: horario.trim() },
        },
        trigger: {
          type: notificacoes.SchedulableTriggerInputTypes.DAILY,
          hour: horarioLido.hora,
          minute: horarioLido.minuto,
          ...(Platform.OS === 'android' ? { channelId: idLembrete } : {}),
        },
      });
      setAgendado(horario.trim());
    } catch {
      setAviso('Não foi possível alterar o lembrete. Confira as permissões do aparelho.');
    } finally {
      emCurso.current = false;
      setOcupado(false);
    }
  }

  return (
    <Cartao>
      <Texto>{agendado ? `Lembrete diário às ${agendado}.` : 'Escolha um horário para o lembrete diário.'}</Texto>
      <CampoTexto rotulo="Horário do lembrete" value={horario} onChangeText={setHorario}
        placeholder="HH:MM" editable={!ocupado} />
      {Boolean(aviso) && <Aviso erro>{aviso}</Aviso>}
      <Botao titulo={agendado ? 'Atualizar horário' : 'Ativar lembrete'}
        onPress={() => alterar(true)} desabilitado={ocupado} />
      {Boolean(agendado) && <Botao titulo="Desativar lembrete" onPress={() => alterar(false)}
        desabilitado={ocupado} secundario />}
    </Cartao>
  );
}

export default function PerfilScreen({ navigation }) {
  const { nome, preferencias, guardarPreferencias, apagarConta, onSair } = useEntrelinhas();
  const [secao, setSecao] = useState('Aparência');
  const [rascunho, setRascunho] = useState(preferencias);
  const [ocupado, setOcupado] = useState(false);
  const [mostrarPolitica, setMostrarPolitica] = useState(false);
  const operacao = useRef(false);

  function escolher(campo, valor) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar() {
    if (operacao.current) return;
    operacao.current = true;
    setOcupado(true);
    Keyboard.dismiss();

    try {
      const novas = { ...rascunho, apelido: rascunho.apelido.trim() };
      await guardarPreferencias(novas);
      setRascunho(novas);
      Alert.alert('Preferências salvas');
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
    } finally {
      operacao.current = false;
      setOcupado(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir sua conta?', 'A conta e todos os registros serão apagados do servidor.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir conta',
        style: 'destructive',
        onPress: async () => {
          if (operacao.current) return;
          operacao.current = true;
          setOcupado(true);
          try {
            await apagarConta();
          } catch (erro) {
            if (erro.status === 401) onSair();
            else Alert.alert('Não foi possível confirmar a exclusão', erro.message);
          } finally {
            operacao.current = false;
            setOcupado(false);
          }
        },
      },
    ]);
  }

  return (
    <Tela titulo="Perfil" teclado>
      <Cartao suave style={linha}>
        <Retrato preferencias={preferencias} />
        <Texto variante="secao" style={{ flex: 1 }}>{nome}</Texto>
      </Cartao>

      <View style={opcoes}>
        {secoes.map((item) => (
          <Opcao key={item} titulo={item} ativa={secao === item}
            onPress={() => setSecao(item)} desabilitada={ocupado} />
        ))}
      </View>

      {secao === 'Aparência' && (
        <Cartao>
          <CampoTexto rotulo="Apelido" value={rascunho.apelido} maxLength={40} editable={!ocupado}
            onChangeText={(valor) => escolher('apelido', valor)} />
          <View style={opcoes}>
            <Opcao titulo="Tema claro" ativa={rascunho.tema === 'claro'} desabilitada={ocupado}
              onPress={() => escolher('tema', 'claro')} />
            <Opcao titulo="Tema escuro" ativa={rascunho.tema === 'escuro'} desabilitada={ocupado}
              onPress={() => escolher('tema', 'escuro')} />
          </View>
          <Texto variante="secao">Meu avatar</Texto>
          <Retrato preferencias={rascunho} tamanho={76} />
          <View style={opcoes}>
            {retratos.map(({ nome: rotulo }, indice) => (
              <Opcao key={rotulo} titulo={rotulo} ativa={rascunho.retrato === indice}
                onPress={() => escolher('retrato', indice)} desabilitada={ocupado} />
            ))}
          </View>
          <Texto>Fundo do avatar</Texto>
          <View style={opcoes}>
            {fundosAvatar.map(({ nome: rotulo }, indice) => (
              <Opcao key={rotulo} titulo={rotulo} ativa={rascunho.fundoAvatar === indice}
                onPress={() => escolher('fundoAvatar', indice)} desabilitada={ocupado} />
            ))}
          </View>
        </Cartao>
      )}

      {secao === 'Acessibilidade' && (
        <Cartao>
          <Opcao titulo="Fonte maior" ativa={rascunho.fonteMaior} desabilitada={ocupado}
            onPress={() => escolher('fonteMaior', !rascunho.fonteMaior)} />
          <Opcao titulo="Contraste reforçado" ativa={rascunho.contraste} desabilitada={ocupado}
            onPress={() => escolher('contraste', !rascunho.contraste)} />
        </Cartao>
      )}

      {(secao === 'Aparência' || secao === 'Acessibilidade') && (
        <Botao titulo="Salvar preferências" onPress={salvar} desabilitado={ocupado} />
      )}

      {secao === 'Lembretes' && <Lembretes />}

      {secao === 'Privacidade' && (
        <Cartao>
          <Link titulo={mostrarPolitica ? 'Fechar termos e privacidade' : 'Ler termos e privacidade'}
            onPress={() => setMostrarPolitica(!mostrarPolitica)} />
          {mostrarPolitica && <PoliticaPrivacidade />}
          <Link titulo="Exportar meus registros" onPress={() => navigation.navigate('Historico', { exportar: true })} />
          <Link titulo="Excluir minha conta" onPress={confirmarExclusao} desabilitado={ocupado} />
        </Cartao>
      )}

      <Botao titulo="Sair da conta" onPress={onSair} desabilitado={ocupado} secundario />
    </Tela>
  );
}