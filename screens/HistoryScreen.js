import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      let searchHistory = await AsyncStorage.getItem('searchHistory');
      setHistory(searchHistory ? JSON.parse(searchHistory) : []);
    };
    loadHistory();
  }, []);

  const clearHistory = async () => {
    await AsyncStorage.removeItem('searchHistory');
    setHistory([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Consultas</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text style={styles.historyItem}>{item}</Text>
        )}
      />
      <Button title="Limpar Histórico" onPress={clearHistory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default HistoryScreen;
