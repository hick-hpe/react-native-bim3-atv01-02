import { useMemo } from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

import { Movimentacao } from '../types';

interface Props {
  movimentacoes: Movimentacao[];
}

function formatarData(data: string): string {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return data;
  }

  return dataConvertida.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function obterNomeProduto(movimentacao: Movimentacao): string {
  const produto = movimentacao.produto;

  if (typeof produto === 'object' && produto !== null) {
    return produto.nome;
  }

  return movimentacao.produto.nome ?? `Produto #${produto}`;
}

function ehEntrada(tipo: string): boolean {
  return tipo.toLowerCase() === 'entrada';
}

export function ListaMovimentacoes({ movimentacoes }: Props) {
  const movimentacoesOrdenadas = useMemo(() => {
    return [...movimentacoes].sort((a, b) => {
      return (
        new Date(b.criadoEm).getTime() -
        new Date(a.criadoEm).getTime()
      );
    });
  }, [movimentacoes]);

  if (movimentacoes.length === 0) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.mensagemVazia}>
          Nenhuma movimentação registrada.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de movimentações</Text>

      <FlatList
        data={movimentacoesOrdenadas}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const entrada = ehEntrada(item.tipo);

          return (
            <View
              style={[
                styles.card,
                entrada ? styles.cardEntrada : styles.cardSaida,
              ]}
            >
              <View style={styles.cabecalho}>
                <Text style={styles.produto}>
                  {obterNomeProduto(item)}
                </Text>

                <View
                  style={[
                    styles.etiqueta,
                    entrada ? styles.etiquetaEntrada : styles.etiquetaSaida,
                  ]}
                >
                  <Text
                    style={[
                      styles.etiquetaTexto,
                      entrada
                        ? styles.textoEntrada
                        : styles.textoSaida,
                    ]}
                  >
                    {entrada ? 'Entrada' : 'Saída'}
                  </Text>
                </View>
              </View>

              <Text style={styles.detalhe}>
                Data: {formatarData(item.criadoEm)}
              </Text>

              <Text style={styles.detalhe}>
                Quantidade: {item.quantidade} unidade(s)
              </Text>
            </View>
          );
        }}
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
    borderRadius: 8,
  },
  cardEntrada: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  cardSaida: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  produto: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  etiqueta: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  etiquetaEntrada: {
    backgroundColor: '#dcfce7',
  },
  etiquetaSaida: {
    backgroundColor: '#fee2e2',
  },
  etiquetaTexto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textoEntrada: {
    color: '#166534',
  },
  textoSaida: {
    color: '#991b1b',
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