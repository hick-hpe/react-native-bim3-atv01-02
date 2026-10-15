import { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Movimentacao } from '../types';
import { movimentacaoApi } from '../api/api';
import { ListaMovimentacoes } from '../components/ListaMovimentacoes';
import { FormularioMovimentacao } from '../components/FormularioMovimentacao';
import { BotaoSair } from '../components/BotaoSair';

export function MovimentacoesScreen() {
  const navigation = useNavigation();

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [erro, setErro] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <BotaoSair />,
    });
  }, [navigation]);

  async function carregarMovimentacoes() {
    try {
      setErro('');

      const dados = await movimentacaoApi.listar();

      setMovimentacoes(dados);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      setErro('Não foi possível carregar o histórico de movimentações.');
    }
  }

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.titulo}>Movimentações</Text>

        {erro ? (
          <Text style={styles.erro}>{erro}</Text>
        ) : (
          <ListaMovimentacoes movimentacoes={movimentacoes} />
        )}

        <FormularioMovimentacao
          onMovimentacaoCriada={carregarMovimentacoes}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  erro: {
    color: '#dc2626',
    marginBottom: 16,
  },
});