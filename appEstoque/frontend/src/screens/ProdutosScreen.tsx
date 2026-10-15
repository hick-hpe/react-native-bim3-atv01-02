import { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Produto } from '../types';
import { produtoApi } from '../api/api';
import { ListaProdutos } from '../components/ListaProdutos';
import { FormularioProduto } from '../components/FormularioProduto';
import { BotaoSair } from '../components/BotaoSair';

export function ProdutosScreen() {
  const navigation = useNavigation();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erro, setErro] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <BotaoSair />,
    });
  }, [navigation]);

  async function carregarProdutos() {
    try {
      setErro('');

      const dados = await produtoApi.listar();

      setProdutos(dados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setErro('Não foi possível carregar os produtos.');
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.titulo}>Produtos</Text>

        {erro ? (
          <Text style={styles.erro}>{erro}</Text>
        ) : (
          <ListaProdutos produtos={produtos} />
        )}

        <FormularioProduto onProdutoCriado={carregarProdutos} />
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