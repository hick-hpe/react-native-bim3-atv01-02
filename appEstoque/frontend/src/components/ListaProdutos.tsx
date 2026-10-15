import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

import { Produto } from '../types';

interface Props {
  produtos: Produto[];
}

function formatarPreco(preco: number | string): string {
  return Number(preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function obterNomeCategoria(produto: Produto): string {
  const categoria = produto.categoria;

  if (typeof categoria === 'object' && categoria !== null) {
    return categoria.nome;
  }

  return produto.categoria.nome ?? 'Categoria não informada';
}

export function ListaProdutos({ produtos }: Props) {
  if (produtos.length === 0) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.mensagemVazia}>
          Nenhum produto cadastrado.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Produtos cadastrados</Text>

      <FlatList
        data={produtos}
        keyExtractor={(produto) => String(produto.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>

            <Text style={styles.detalhe}>
              ID: {item.id}
            </Text>

            <Text style={styles.detalhe}>
              Categoria: {obterNomeCategoria(item)}
            </Text>

            <Text style={styles.detalhe}>
              Preço: {formatarPreco(item.preco)}
            </Text>

            <Text style={styles.detalhe}>
              Estoque: {item.quantidade} unidade(s)
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detalhe: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  vazio: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
  },
  mensagemVazia: {
    fontSize: 15,
    color: '#666',
  },
});