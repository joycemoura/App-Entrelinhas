import { Fragment } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import Botao from '../components/Botao';
import { AvatarHumor, Aviso, Cartao, Link, Retrato, Tela, Texto } from '../components/Interface';
import { useEntrelinhas } from '../state/Entrelinhas';
import { momentoLocal } from '../utils/datas';

export default function InicioScreen({ navigation }) {
  const { nome, paleta, preferencias, registros, carregando, erroHistorico, carregarHistorico, meusHumores } = useEntrelinhas();
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const escuro = preferencias.tema === 'escuro';

  const modulos = {
    humor: (
      <Cartao>
        <Texto variante="secao">Meu humor hoje</Texto>
        <View style={estilos.humores}>
          {meusHumores.map((humor) => <AvatarHumor key={humor.id} humor={humor} tamanho={38} />)}
        </View>
        <Botao titulo="Criar humor" onPress={() => navigation.navigate('Diario')} />
      </Cartao>
    ),
    conversa: (
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Conversa')}>
        <Cartao style={{ backgroundColor: escuro ? '#313B32' : '#E8EBDD' }}>
          <View style={estilos.linha}>
            <Ionicons name="sparkles-outline" size={22} color={escuro ? '#D0DEB7' : '#4E623D'} />
            <View style={{ flex: 1, gap: 3 }}>
              <Texto variante="secao">Conversa com IA</Texto>
              <Texto variante="nota">Dúvidas sobre o diário e a reflexão</Texto>
            </View>
            <Ionicons name="chevron-forward" size={16} color={paleta.textoSecundario} />
          </View>
        </Cartao>
      </Pressable>
    ),
    recentes: (
      <>
        <View style={estilos.linha}>
          <Texto variante="secao" accessibilityRole="header">Registros recentes</Texto>
          <Link titulo="Ver todos" onPress={() => navigation.navigate('Historico')} />
        </View>

        {carregando && !registros.length && <Aviso>Carregando registros...</Aviso>}
        {Boolean(erroHistorico) && (
          <Cartao>
            <Aviso erro>{erroHistorico}</Aviso>
            <Link titulo="Tentar novamente" onPress={carregarHistorico} />
          </Cartao>
        )}
        {!carregando && !erroHistorico && !registros.length && (
          <Cartao><Texto variante="nota">Seus registros vão aparecer aqui.</Texto></Cartao>
        )}

        {registros.slice(0, 3).map((registro) => {
          const humor = meusHumores.find((item) => item.id === registro.humor);
          return (
            <Cartao key={registro.id}>
              <View style={estilos.linha}>
                <AvatarHumor humor={humor} tamanho={44} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Texto>{registro.titulo || humor?.nome}</Texto>
                  <Texto variante="nota">{momentoLocal(registro.registrado_em)}</Texto>
                </View>
              </View>
            </Cartao>
          );
        })}
      </>
    ),
    reflexao: (
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Reflexao')}>
        <Cartao style={estilos.linha}>
          <Ionicons name="journal-outline" size={23} color={paleta.destaque} />
          <Texto variante="secao" style={{ flex: 1 }}>Reflexão</Texto>
          <Ionicons name="chevron-forward" size={16} color={paleta.textoSecundario} />
        </Cartao>
      </Pressable>
    ),
  };

  return (
    <Tela>
      <View style={[estilos.abertura, { backgroundColor: escuro ? '#352930' : '#F1E0CD' }]}>
        <View style={estilos.linha}>
          <Texto style={estilos.marca}>entrelinhas.</Texto>
          <Pressable
            onPress={() => navigation.navigate('MeuAvatar')}
            accessibilityRole="button"
            accessibilityLabel="Meu avatar"
            style={estilos.atalhoPerfil}
          >
            <Retrato preferencias={preferencias} tamanho={34} />
          </Pressable>
        </View>

        <View style={estilos.linha}>
          <View style={estilos.saudacao}>
            <Texto variante="nota">{saudacao}, {nome}.</Texto>
            <Texto variante="editorial">Como você está,</Texto>
            <Texto variante="editorial" style={{ color: paleta.destaque }}>de verdade?</Texto>
          </View>
          <View style={[estilos.sol, { backgroundColor: escuro ? '#4D3C37' : '#EFCEA3' }]}>
            <Ionicons name={hora < 18 ? 'sunny-outline' : 'moon-outline'} size={28} color={escuro ? '#F8CC87' : '#854A29'} />
          </View>
        </View>
      </View>

      {preferencias.ordem.map((modulo) => (
        <Fragment key={modulo}>{modulos[modulo]}</Fragment>
      ))}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  abertura: { padding: 18, gap: 12, borderRadius: 25 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  marca: { fontWeight: '800', letterSpacing: -0.4 },
  atalhoPerfil: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  saudacao: { flex: 1, gap: 3 },
  sol: { height: 52, width: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  humores: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 4 },
});