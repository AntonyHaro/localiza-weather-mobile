import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const CepSearchScreen = () => {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  // Carregar o histórico de consultas do AsyncStorage
  const loadHistory = async () => {
    let searchHistory = await AsyncStorage.getItem('searchHistory');
    setHistory(searchHistory ? JSON.parse(searchHistory) : []);
  };

  // Salvar o novo CEP no histórico, se ainda não estiver lá
  const saveSearchHistory = async (newCep) => {
    let updatedHistory = history.includes(newCep) ? history : [...history, newCep];
    setHistory(updatedHistory);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // Limpar o histórico de consultas
  const clearHistory = async () => {
    await AsyncStorage.removeItem('searchHistory');
    setHistory([]);
  };

  // Função para buscar o endereço a partir do CEP usando a API ViaCEP
  const buscarEndereco = async (newCep = cep) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${newCep}/json/`);
      if (response.data.erro) {
        setAddress(null);
        alert('CEP não encontrado.');
      } else {
        setAddress(response.data);
        saveSearchHistory(newCep);
      }
    } catch (error) {
      alert('Erro ao buscar o CEP.');
    }
  };

  // Função para lidar com o clique em um item do histórico
  const handleHistoryClick = (clickedCep) => {
    setCep(clickedCep);  // Preencher o campo de entrada com o CEP clicado
    buscarEndereco(clickedCep);  // Buscar o endereço do CEP clicado
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta de CEP</Text>
      
      {/* Campo de entrada do CEP */}
      <TextInput
        style={styles.input}
        placeholder="Digite o CEP"
        value={cep}
        onChangeText={setCep}
        keyboardType="numeric"
        maxLength={8}
      />
      
      {/* Botão para buscar o endereço */}
      <TouchableOpacity style={styles.button} onPress={() => buscarEndereco()}>
        <Text style={styles.buttonText}>Buscar Endereço</Text>
      </TouchableOpacity>

      {/* Resultado da busca de endereço */}
      {address && (
        <View style={styles.result}>
          <Text>Logradouro: {address.logradouro}</Text>
          <Text>Bairro: {address.bairro}</Text>
          <Text>Cidade: {address.localidade}</Text>
          <Text>Estado: {address.uf}</Text>
        </View>
      )}

      {/* Histórico de consultas */}
      <View style={styles.history}>
        <Text style={styles.historyTitle}>Histórico de Consultas</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleHistoryClick(item)}>
              <Text style={styles.historyItem}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.button} onPress={clearHistory}>
          <Text style={styles.buttonText}>Limpar Histórico</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#191970',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    marginTop: 20,
  },
  history: {
    marginTop: 40,
  },
  historyTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default CepSearchScreen;

