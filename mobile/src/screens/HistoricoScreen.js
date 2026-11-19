import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import Botao from '../components/Botao';
import { AvatarHumor, Aviso, Cartao, Link, Opcao, Tela, Texto } from '../components/Interface';
import { consultarMinhaConta, listarRegistros } from '../services/api';
import { montarRelatorio, salvarRelatorioPdf } from '../services/relatorio';
import { useEntrelinhas } from '../state/Entrelinhas';
import { dataCurta, momentoLocal, registrosDoMes } from '../utils/datas';

const abas = ['Calendário', 'Registros'];
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function Calendario({ mes, registros, dia, onDia }) {
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const espacos = primeiro.getDay();
  const { paleta } = useEntrelinhas();

  return (
    <>
      <View style={estilos.grade}>
        {diasSemana.map((semana) => (
          <View key={semana} style={estilos.celula}>
            <Texto variante="nota" style={estilos.centro}>{semana}</Texto>
          </View>
        ))}
        {Array.from({ length: espacos + total }, (_, posicao) => {
          const numero = posicao - espacos + 1;
          if (numero < 1) return <View key={posicao} style={estilos.celula} />;
          const data = new Date(mes.getFullYear(), mes.getMonth(), numero);
          const quantidade = registros.filter((item) => new Date(item.registrado_em).getDate() === numero).length;

          return (
            <Pressable
              key={posicao}
              accessibilityRole="button"
              accessibilityLabel={`${dataCurta(data)}, ${quantidade} registros`}
              accessibilityState={{ selected: dia === numero }}
              onPress={() => onDia(dia === numero ? null : numero)}
              style={[
                estilos.celula, estilos.dia,
                dia === numero && { backgroundColor: paleta.superficieSuave },
              ]}
            >
              <Texto variante="nota" style={estilos.centro}>{numero}</Texto>
              {quantidade > 0 && <View style={[estilos.ponto, { backgroundColor: paleta.destaque }]} />}
            </Pressable>
          );
        })}
      </View>
      {dia && <Link titulo="Mostrar o mês todo" onPress={() => onDia(null)} />}
    </>
  );
}

function Estatisticas({ registros }) {
  const { paleta, meusHumores, escala } = useEntrelinhas();
  const total = registros.length;
  const contagens = new Map();
  for (const { humor } of registros) contagens.set(humor, (contagens.get(humor) ?? 0) + 1);
  const colunas = meusHumores.map((humor) => ({ ...humor, quantidade: contagens.get(humor.id) ?? 0 }));
  const maiorContagem = Math.max(0, ...colunas.map(({ quantidade }) => quantidade));
  const passo = Math.max(1, Math.ceil(maiorContagem / 4));
  const marcas = [4, 3, 2, 1, 0].map((multiplicador) => multiplicador * passo);
  const alturaGrafico = 138;
  const espacoContagem = 30;

  return (
    <Cartao>
      <Texto variante="secao">Registros por humor</Texto>
      <Texto variante="nota">{total} {total === 1 ? 'registro' : 'registros'} no mês</Texto>
      {total === 0 ? <Aviso>Faça um registro para ver o gráfico deste mês.</Aviso> : (
        <View style={estilos.grafico}>
          <View style={[estilos.escala, { height: alturaGrafico + 12, marginTop: espacoContagem - 6 }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {marcas.map((valor) => (
              <Texto key={valor} variante="nota" style={estilos.marca}>{valor}</Texto>
            ))}
          </View>
          <View style={estilos.larguraGrafico}>
            <View style={[estilos.gradeGrafico, { height: alturaGrafico, top: espacoContagem }]} pointerEvents="none">
              {marcas.map((valor) => (
                <View key={valor} style={[estilos.linhaGrafico, { backgroundColor: paleta.borda }]} />
              ))}
            </View>
            <View style={estilos.colunas}>
              {colunas.map((humor) => (
                <View key={humor.id} style={estilos.coluna} accessible accessibilityLabel={`${humor.nome}, ${humor.quantidade} de ${total} registros`}>
                  <View style={[estilos.areaBarra, { height: alturaGrafico + espacoContagem }]}>
                    <Texto variante="nota" style={estilos.contagem}>{humor.quantidade}</Texto>
                    {humor.quantidade > 0 && (
                      <View style={[estilos.barra, {
                        height: Math.max(1, alturaGrafico * humor.quantidade / marcas[0]),
                        backgroundColor: humor.cor, borderColor: paleta.borda,
                      }]} />
                    )}
                  </View>
                  <Texto variante="nota" style={[estilos.rotuloBarra, { fontSize: 11 * escala }]}>{humor.nome}</Texto>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </Cartao>
  );
}

function Registro({ registro, visivel, abrir, editar, refletir, excluir, removendo }) {
  const { meusHumores } = useEntrelinhas();
  const humor = meusHumores.find(({ id }) => id === registro.humor);

  return (
    <Cartao>
      <View style={estilos.linha}>
        <AvatarHumor humor={humor} tamanho={44} />
        <View style={{ flex: 1, gap: 4 }}>
          <Texto variante="secao">{registro.titulo || humor.nome}</Texto>
          <Texto variante="nota">{momentoLocal(registro.registrado_em)}</Texto>
        </View>
      </View>
      <Link titulo={visivel ? 'Fechar detalhes' : 'Ver detalhes'} onPress={abrir} />
      {visivel && (
        <>
          {registro.titulo && <Texto>Humor · {humor.nome}</Texto>}
          {registro.contextos.length > 0 && <Texto>{registro.contextos.join(' · ')}</Texto>}
          {registro.anotacao && <Texto>{registro.anotacao}</Texto>}
          <Link titulo="Editar registro" onPress={editar} desabilitado={removendo} />
          <Link titulo="Refletir sobre este registro" onPress={refletir} desabilitado={removendo} />
          <Link titulo={removendo ? 'Excluindo...' : 'Excluir registro'} onPress={excluir} desabilitado={removendo} />
        </>
      )}
    </Cartao>
  );
}

export default function HistoricoScreen({ navigation, route }) {
  const { sessao, onSair, registros, carregando, erroHistorico, carregarHistorico, apagar, meusHumores } = useEntrelinhas();
  const estatisticas = route.name === 'Estatisticas';
  const [aba, setAba] = useState('Calendário');
  const [mes, setMes] = useState(() => new Date());
  const [dia, setDia] = useState(null);
  const [humorFiltro, setHumorFiltro] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [removendo, setRemovendo] = useState(null);
  const [exportando, setExportando] = useState(null);
  const [mostrarExportacao, setMostrarExportacao] = useState(false);
  const exportacaoEmCurso = useRef(false);
  const exclusaoEmCurso = useRef(false);
  const telaAtiva = useRef(true);
  const desteMes = registrosDoMes(registros, mes);
  const visiveis = desteMes.filter((registro) => (
    (!humorFiltro || registro.humor === humorFiltro)
    && (aba !== 'Calendário' || !dia || new Date(registro.registrado_em).getDate() === dia)
  ));
  const mesPorExtenso = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  useEffect(() => {
    telaAtiva.current = true;
    return () => { telaAtiva.current = false; };
  }, []);

  useEffect(() => {
    if (route.params?.exportar) {
      setMostrarExportacao(true);
      navigation.setParams({ exportar: false });
    }
  }, [navigation, route.params?.exportar]);

  function mudarMes(diferenca) {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + diferenca, 1));
    setDia(null);
    setDetalhe(null);
  }

  async function remover(id) {
    if (exclusaoEmCurso.current) return;
    exclusaoEmCurso.current = true;
    setRemovendo(id);
    try {
      await apagar(id);
      setDetalhe(null);
    } catch (erro) {
      if (erro.status !== 401) Alert.alert('Não foi possível excluir', erro.message);
    } finally {
      exclusaoEmCurso.current = false;
      setRemovendo(null);
    }
  }

  function confirmarExclusao(id) {
    Alert.alert('Excluir registro?', 'O registro será removido do seu histórico.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remover(id) },
    ]);
  }

  function oferecerImpressao(todos, titulo, mensagem) {
    Alert.alert(titulo, mensagem, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Abrir impressão', onPress: () => exportar(todos, true) },
    ]);
  }

  async function exportar(todos, imprimir = false) {
    if (exportacaoEmCurso.current || !telaAtiva.current) return;
    exportacaoEmCurso.current = true;
    setExportando(todos ? 'completo' : 'mes');

    try {
      const [persistidos, perfil] = await Promise.all([
        listarRegistros(sessao.token),
        consultarMinhaConta(sessao.token),
      ]);
      if (!telaAtiva.current) return;

      const selecionados = todos ? persistidos : registrosDoMes(persistidos, mes);
      const periodo = todos ? 'Dados da conta e histórico completo' : mesPorExtenso;
      const sufixo = todos ? 'completo' : `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`;
      const html = montarRelatorio({ registros: selecionados, perfil, periodo, humores: meusHumores });
      const nomeArquivo = `Entrelinhas-${sufixo}`;
      const resultado = await salvarRelatorioPdf({
        html, nomeArquivo, podeSalvar: () => telaAtiva.current, imprimir,
      });
      if (!telaAtiva.current) return;
      if (resultado === 'salvo') {
        Alert.alert('PDF salvo', `Procure por ${nomeArquivo} no app Arquivos, na pasta que você escolheu.`);
      } else if (resultado === 'cancelado') {
        oferecerImpressao(todos, 'Nenhuma pasta selecionada',
          'Tente novamente escolhendo Documentos e toque em “Usar esta pasta”. Você também pode abrir a impressão e selecionar “Salvar como PDF”.');
      }
    } catch (erro) {
      if (!telaAtiva.current) return;
      if (erro.status === 401) onSair();
      else if (erro.codigo === 'PASTA_PDF') {
        oferecerImpressao(todos, 'Não foi possível salvar na pasta',
          'Escolha outra pasta ou abra a impressão para selecionar “Salvar como PDF”.');
      } else Alert.alert('Não foi possível exportar', erro.message);
    } finally {
      exportacaoEmCurso.current = false;
      if (telaAtiva.current) setExportando(null);
    }
  }

  return (
    <Tela titulo={estatisticas ? 'Estatísticas' : 'Calendário'}>
      {!estatisticas && (
        <View style={estilos.abas}>
          {abas.map((opcao) => <Opcao key={opcao} titulo={opcao} ativa={aba === opcao} onPress={() => setAba(opcao)} />)}
        </View>
      )}

      <Cartao>
        <View style={estilos.linha}>
          <Link titulo="‹ Anterior" onPress={() => mudarMes(-1)} />
          <Texto style={[estilos.centro, { flex: 1 }]}>{mesPorExtenso}</Texto>
          <Link titulo="Próximo ›" onPress={() => mudarMes(1)} />
        </View>
        <Link
          titulo={mostrarExportacao ? 'Fechar exportação' : 'Exportar PDF'}
          onPress={() => setMostrarExportacao(!mostrarExportacao)}
          desabilitado={Boolean(exportando)}
        />
        {mostrarExportacao && (
          <>
            <Texto variante="nota">O relatório inclui os dados da conta e os registros do mês exibido ou do histórico completo.</Texto>
            <Botao titulo={exportando === 'mes' ? 'Preparando PDF...' : 'Salvar PDF do mês'} onPress={() => exportar(false)} desabilitado={Boolean(exportando)} />
            <Botao titulo={exportando === 'completo' ? 'Preparando PDF...' : 'Salvar todos os meus dados em PDF'} onPress={() => exportar(true)} desabilitado={Boolean(exportando)} secundario />
          </>
        )}
      </Cartao>

      {carregando && <Aviso>Atualizando registros...</Aviso>}
      {Boolean(erroHistorico) && (
        <Cartao>
          <Aviso erro>{erroHistorico}</Aviso>
          <Link titulo="Tentar novamente" onPress={carregarHistorico} />
        </Cartao>
      )}

      {!estatisticas && aba === 'Calendário' && (
        <Cartao>
          <Calendario mes={mes} registros={desteMes} dia={dia} onDia={setDia} />
          <Texto variante="nota">{dia ? `Registros do dia ${dia}` : 'Toque em um dia para ver seus registros.'}</Texto>
        </Cartao>
      )}

      {estatisticas ? <Estatisticas registros={desteMes} /> : (
        <>
          {desteMes.length > 0 && (
            <Cartao>
              <Texto variante="nota">Filtrar por humor</Texto>
              <View style={estilos.abas}>
                <Opcao titulo="Todos" ativa={!humorFiltro} onPress={() => setHumorFiltro(null)} />
                {meusHumores.map((humor) => (
                  <Opcao key={humor.id} titulo={humor.nome} ativa={humorFiltro === humor.id}
                    onPress={() => setHumorFiltro(humor.id)} />
                ))}
              </View>
            </Cartao>
          )}
          {!carregando && !erroHistorico && visiveis.length === 0 && <Aviso>Sem registros neste período.</Aviso>}
          {visiveis.map((registro) => (
            <Registro
              key={registro.id}
              registro={registro}
              visivel={detalhe === registro.id}
              abrir={() => setDetalhe(detalhe === registro.id ? null : registro.id)}
              editar={() => navigation.navigate('Diario', { registroId: registro.id })}
              refletir={() => navigation.navigate('Conversa', { registroId: registro.id })}
              excluir={() => confirmarExclusao(registro.id)}
              removendo={removendo === registro.id}
            />
          ))}
        </>
      )}
    </Tela>
  );
}

export { HistoricoScreen as EstatisticasScreen };

const estilos = StyleSheet.create({
  abas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  centro: { textAlign: 'center' },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: '14.2857%', minHeight: 32, justifyContent: 'center' },
  dia: { minHeight: 48, alignItems: 'center', gap: 4, borderRadius: 12 },
  ponto: { width: 5, height: 5, borderRadius: 3 },
  grafico: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  escala: { minWidth: 20, justifyContent: 'space-between', alignItems: 'flex-end' },
  marca: { fontSize: 11, lineHeight: 12 },
  larguraGrafico: { flex: 1 },
  gradeGrafico: { position: 'absolute', left: 0, right: 0, justifyContent: 'space-between' },
  linhaGrafico: { height: StyleSheet.hairlineWidth, opacity: 0.55 },
  colunas: { flexDirection: 'row', gap: 4 },
  coluna: { flex: 1, minWidth: 0, alignItems: 'center', gap: 7 },
  areaBarra: { width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  barra: { width: '62%', maxWidth: 36, borderWidth: StyleSheet.hairlineWidth, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  contagem: { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  rotuloBarra: { textAlign: 'center' },
});