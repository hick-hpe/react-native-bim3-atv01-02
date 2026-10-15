import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

import { Produto, TipoMovimentacao } from '../types';
import { produtoApi, movimentacaoApi } from '../api/api';

interface Props {
  onMovimentacaoCriada: () => void | Promise<void>;
}

export function FormularioMovimentacao({
  onMovimentacaoCriada,
}: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [produtoId, setProdutoId] = useState('');
  const [tipo, setTipo] = useState<TipoMovimentacao | ''>('');
  const [quantidade, setQuantidade] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const dados = await produtoApi.listar();
        setProdutos(dados);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setErro('Não foi possível carregar os produtos.');
      } finally {
        setCarregandoProdutos(false);
      }
    }

    carregarProdutos();
  }, []);

  const produtoSelecionado = produtos.find(
    (produto) => String(produto.id) === produtoId,
  );

  async function atualizarProdutos() {
    const dados = await produtoApi.listar();
    setProdutos(dados);
  }

  async function handleSubmit() {
    setErro('');
    setSucesso('');

    if (!produtoId || !tipo || !quantidade.trim()) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const quantidadeNumerica = Number(quantidade);

    if (
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      setErro('Informe uma quantidade inteira maior que zero.');
      return;
    }

    if (!produtoSelecionado) {
      setErro('Selecione um produto válido.');
      return;
    }

    if (
      tipo === 'SAIDA' &&
      quantidadeNumerica > produtoSelecionado.quantidade
    ) {
      setErro(
        `Estoque insuficiente. Disponível: ${produtoSelecionado.quantidade} unidade(s).`,
      );
      return;
    }

    setSalvando(true);

    try {
      await movimentacaoApi.criar({
        produtoId: Number(produtoId),
        tipo,
        quantidade: quantidadeNumerica,
      });

      setProdutoId('');
      setTipo('');
      setQuantidade('');

      setSucesso('Movimentação registrada com sucesso!');

      // Atualiza o histórico e os produtos após o cadastro.
      const resultados = await Promise.allSettled([
        onMovimentacaoCriada(),
        atualizarProdutos(),
      ]);

      if (resultados.some((resultado) => resultado.status === 'rejected')) {
        setErro(
          'Movimentação registrada, mas não foi possível atualizar todos os dados exibidos.',
        );
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      setErro('Não foi possível registrar a movimentação.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.titulo}>Nova movimentação</Text>

      {/* Produto */}
      <View style={styles.campo}>
        <Text style={styles.label}>Produto *</Text>

        {carregandoProdutos ? (
          <View style={styles.carregandoContainer}>
            <ActivityIndicator color="#2563eb" />
          </View>
        ) : produtos.length === 0 ? (
          <Text style={styles.aviso}>
            Cadastre um produto antes de registrar uma movimentação.
          </Text>
        ) : (
          <View
            style={[
              styles.seletorContainer,
              salvando && styles.campoDesabilitado,
            ]}
          >
            <Picker
              selectedValue={produtoId}
              onValueChange={(valor) => setProdutoId(String(valor))}
              enabled={!salvando}
              style={styles.picker}
              dropdownIconColor="#6b7280"
              mode="dropdown"
            >
              <Picker.Item
                label="Selecione um produto"
                value=""
                color="#9ca3af"
              />

              {produtos.map((produto) => (
                <Picker.Item
                  key={produto.id}
                  label={`${produto.nome} — Estoque: ${produto.quantidade} un.`}
                  value={String(produto.id)}
                  color="#111827"
                />
              ))}
            </Picker>
          </View>
        )}

        {produtoSelecionado && (
          <View style={styles.estoqueContainer}>
            <Text style={styles.estoque}>
              Estoque atual: {produtoSelecionado.quantidade} unidade(s)
            </Text>
          </View>
        )}
      </View>

      {/* Tipo de movimentação */}
      <View style={styles.campo}>
        <Text style={styles.label}>Tipo de movimentação *</Text>

        <View
          style={[
            styles.seletorContainer,
            salvando && styles.campoDesabilitado,
          ]}
        >
          <Picker
            selectedValue={tipo}
            onValueChange={(valor) =>
              setTipo(valor as TipoMovimentacao | '')
            }
            enabled={!salvando}
            style={styles.picker}
            dropdownIconColor="#6b7280"
            mode="dropdown"
          >
            <Picker.Item
              label="Selecione o tipo"
              value=""
              color="#9ca3af"
            />

            <Picker.Item
              label="Entrada"
              value="ENTRADA"
              color="#15803d"
            />

            <Picker.Item
              label="Saída"
              value="SAIDA"
              color="#dc2626"
            />
          </Picker>
        </View>
      </View>

      {/* Quantidade */}
      <View style={styles.campo}>
        <Text style={styles.label}>Quantidade *</Text>

        <TextInput
          style={[
            styles.input,
            salvando && styles.campoDesabilitado,
          ]}
          placeholder="Informe a quantidade"
          placeholderTextColor="#9ca3af"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="number-pad"
          editable={!salvando}
        />
      </View>

      {/* Mensagens */}
      {erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : null}

      {sucesso ? (
        <Text style={styles.sucesso}>{sucesso}</Text>
      ) : null}

      {/* Botão */}
      <TouchableOpacity
        style={[
          styles.botao,
          (
            salvando ||
            carregandoProdutos ||
            produtos.length === 0
          ) && styles.botaoDesabilitado,
        ]}
        onPress={handleSubmit}
        disabled={
          salvando ||
          carregandoProdutos ||
          produtos.length === 0
        }
        activeOpacity={0.8}
      >
        {salvando ? (
          <View style={styles.botaoCarregando}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.botaoTexto}>Registrando...</Text>
          </View>
        ) : (
          <Text style={styles.botaoTexto}>
            Registrar movimentação
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 8,
    padding: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },

  titulo: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 22,
  },

  campo: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  seletorContainer: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },

  picker: {
    width: '100%',
    height: 50,
    color: '#111827',
    marginLeft: 0,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 14,
  },

  campoDesabilitado: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },

  carregandoContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },

  aviso: {
    fontSize: 13,
    color: '#b45309',
    lineHeight: 20,
  },

  estoqueContainer: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
  },

  estoque: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },

  erro: {
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },

  sucesso: {
    color: '#15803d',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },

  botao: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 8,
    marginTop: 2,
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },

  botaoCarregando: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  botaoTexto: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});