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

import { Categoria } from '../types';
import { categoriaApi, produtoApi } from '../api/api';

interface Props {
  onProdutoCriado: () => void | Promise<void>;
}

export function FormularioProduto({ onProdutoCriado }: Props) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [carregandoCategorias, setCarregandoCategorias] =
    useState(true);

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const dados = await categoriaApi.listar();
        setCategorias(dados);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setErro('Não foi possível carregar as categorias.');
      } finally {
        setCarregandoCategorias(false);
      }
    }

    carregarCategorias();
  }, []);

  async function handleSubmit() {
    setErro('');
    setSucesso('');

    if (
      !nome.trim() ||
      !preco.trim() ||
      !quantidade.trim() ||
      !categoriaId
    ) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    // Aceita preços com vírgula ou ponto decimal.
    const precoNumerico = Number(preco.trim().replace(',', '.'));
    const quantidadeNumerica = Number(quantidade);

    if (!Number.isFinite(precoNumerico) || precoNumerico < 0) {
      setErro('Informe um preço válido.');
      return;
    }

    if (
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica < 0
    ) {
      setErro('Informe uma quantidade inteira válida.');
      return;
    }

    setSalvando(true);

    try {
      await produtoApi.criar({
        nome: nome.trim(),
        preco: precoNumerico,
        quantidade: quantidadeNumerica,
        categoriaId: Number(categoriaId),
      });

      setNome('');
      setPreco('');
      setQuantidade('');
      setCategoriaId('');

      setSucesso('Produto cadastrado com sucesso!');

      await onProdutoCriado();
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      setErro('Não foi possível cadastrar o produto.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.titulo}>Novo produto</Text>

      {/* Nome */}
      <View style={styles.campo}>
        <Text style={styles.label}>
          Nome <Text style={styles.obrigatorio}>*</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          placeholderTextColor="#9ca3af"
          value={nome}
          onChangeText={setNome}
          editable={!salvando}
        />
      </View>

      {/* Preço */}
      <View style={styles.campo}>
        <Text style={styles.label}>
          Preço (R$) <Text style={styles.obrigatorio}>*</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex.: 8,50"
          placeholderTextColor="#9ca3af"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
          editable={!salvando}
        />
      </View>

      {/* Quantidade */}
      <View style={styles.campo}>
        <Text style={styles.label}>
          Quantidade inicial{' '}
          <Text style={styles.obrigatorio}>*</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex.: 20"
          placeholderTextColor="#9ca3af"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="number-pad"
          editable={!salvando}
        />
      </View>

      {/* Categoria */}
      <View style={styles.campo}>
        <Text style={styles.label}>
          Categoria <Text style={styles.obrigatorio}>*</Text>
        </Text>

        {carregandoCategorias ? (
          <View style={styles.carregandoContainer}>
            <ActivityIndicator color="#2563eb" />
          </View>
        ) : categorias.length === 0 ? (
          <Text style={styles.aviso}>
            Cadastre uma categoria antes de cadastrar um produto.
          </Text>
        ) : (
          <View
            style={[
              styles.seletorContainer,
              salvando && styles.campoDesabilitado,
            ]}
          >
            <Picker
              selectedValue={categoriaId}
              onValueChange={(valor) =>
                setCategoriaId(String(valor))
              }
              enabled={!salvando}
              style={styles.picker}
              dropdownIconColor="#6b7280"
              mode="dropdown"
            >
              <Picker.Item
                label="Selecione uma categoria"
                value=""
                color="#9ca3af"
              />

              {categorias.map((categoria) => (
                <Picker.Item
                  key={categoria.id}
                  label={categoria.nome}
                  value={String(categoria.id)}
                  color="#111827"
                />
              ))}
            </Picker>
          </View>
        )}
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
            carregandoCategorias ||
            categorias.length === 0
          ) && styles.botaoDesabilitado,
        ]}
        onPress={handleSubmit}
        disabled={
          salvando ||
          carregandoCategorias ||
          categorias.length === 0
        }
        activeOpacity={0.8}
      >
        {salvando ? (
          <View style={styles.botaoCarregando}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.botaoTexto}>Salvando...</Text>
          </View>
        ) : (
          <Text style={styles.botaoTexto}>
            Cadastrar produto
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

  obrigatorio: {
    color: '#dc2626',
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