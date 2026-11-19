import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import { Aviso, Cartao, Tela, Texto } from '../components/Interface';
import { lerHorario } from '../utils/datas';

const idLembrete = 'entrelinhas-lembrete-diario';

export default function Lembretes({ navigation }) {
  const [horario, setHorario] = useState('20:00');
  const [agendado, setAgendado] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const emCurso = useRef(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const modulo = await import('expo-notifications');
        const lista = await modulo.getAllScheduledNotificationsAsync();
        const lembrete = lista.find(({ identifier }) => identifier === idLembrete);
        if (ativo && lembrete?.content.data?.horario) {
          setHorario(lembrete.content.data.horario);
          setAgendado(lembrete.content.data.horario);
        }
      } catch {
        if (ativo) setErro('Não foi possível consultar o lembrete neste aparelho.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => { ativo = false; };
  }, []);

  async function alterar(ativar) {
    if (emCurso.current || carregando) return;

    const horarioLido = lerHorario(horario);
    if (ativar && !horarioLido) {
      setErro('Informe o horário no formato HH:MM.');
      return;
    }

    emCurso.current = true;
    setCarregando(true);
    setErro('');
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
        setErro('Ative as notificações do aplicativo nos ajustes do aparelho.');
        return;
      }

      const selecionado = horario.trim();
      await notificacoes.scheduleNotificationAsync({
        identifier: idLembrete,
        content: {
          title: 'Entrelinhas',
          body: 'Se quiser, reserve um momento para o seu diário.',
          data: { horario: selecionado },
        },
        trigger: {
          type: notificacoes.SchedulableTriggerInputTypes.DAILY,
          hour: horarioLido.hora,
          minute: horarioLido.minuto,
          ...(Platform.OS === 'android' ? { channelId: idLembrete } : {}),
        },
      });
      setAgendado(selecionado);
    } catch {
      setErro('Não foi possível alterar o lembrete. Confira as permissões do aparelho.');
    } finally {
      emCurso.current = false;
      setCarregando(false);
    }
  }

  return (
    <Tela titulo="Lembretes" menu={false} teclado voltar={() => navigation.goBack()}>
      <Cartao>
        <Texto variante="nota">
          {agendado ? `Lembrete diário às ${agendado} neste aparelho.` : 'Escolha um horário para receber um lembrete diário.'}
        </Texto>
        <CampoTexto rotulo="Horário do lembrete" value={horario} onChangeText={setHorario} placeholder="HH:MM" editable={!carregando} />
        {Boolean(erro) && <Aviso erro>{erro}</Aviso>}
        <Botao titulo={agendado ? 'Atualizar horário' : 'Ativar lembrete'} onPress={() => alterar(true)} desabilitado={carregando} />
        {Boolean(agendado) && <Botao titulo="Desativar lembrete" onPress={() => alterar(false)} desabilitado={carregando} secundario />}
      </Cartao>
    </Tela>
  );
}