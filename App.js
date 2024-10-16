import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const App = () => {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(null);
  const [history, setHistory] = useState([]);

  const [humidity, setHumidity] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [pressure, setPressure] = useState(null);
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [maxTemp, setMaxTemp] = useState(null);
  const [minTemp, setMinTemp] = useState(null);
  const [currentTemperature, setCurrentTemperature] = useState(null);

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
    let updatedHistory = history.includes(newCep)
      ? history
      : [...history, newCep];
    setHistory(updatedHistory);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // Limpar o histórico de consultas
  const clearHistory = async () => {
    await AsyncStorage.removeItem('searchHistory');
    setHistory([]);
  };

  // Função para formatar horário de nascer/pôr do sol
  const formatSunTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  // Buscar dados climáticos
  const fetchWeather = async (city) => {
    const apiKey = 'API_KEY';

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`;

    try {
      const weatherResponse = await axios.get(currentWeatherUrl);
      const weatherData = weatherResponse.data;

      setCurrentTemperature(weatherData.main.temp);
      setFeelsLike(weatherData.main.feels_like);
      setHumidity(weatherData.main.humidity);
      setPressure(weatherData.main.pressure);
      setSunrise(formatSunTime(weatherData.sys.sunrise));
      setSunset(formatSunTime(weatherData.sys.sunset));
      setMaxTemp(weatherData.main.temp_max);
      setMinTemp(weatherData.main.temp_min);
    } catch (error) {
      console.log('Erro na solicitação:', error);
    }
  };

  // Função para buscar o endereço a partir do CEP usando a API ViaCEP
  const fetchData = async (newCep = cep) => {
    try {
      const responseCep = await axios.get(
        `https://viacep.com.br/ws/${newCep}/json/`
      );
      if (responseCep.data.erro) {
        setAddress(null);
        alert('CEP não encontrado.');
        return;
      }

      setAddress(responseCep.data);
      saveSearchHistory(newCep);
      const weather = await fetchWeather(responseCep.data.localidade);
    } catch (error) {
      alert('Erro ao buscar o CEP.');
    }
  };

  // Função para lidar com o clique em um item do histórico
  const handleHistoryClick = (clickedCep) => {
    setCep(clickedCep); // Preencher o campo de entrada com o CEP clicado
    fetchData(clickedCep); // Buscar o endereço do CEP clicado
  };

  return (
    <ScrollView>
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
        <TouchableOpacity style={styles.button} onPress={() => fetchData()}>
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

        {/* Exibição de dados climáticos */}
        {currentTemperature && (
          <View style={styles.weather}>
            <Text>Temperatura Atual: {currentTemperature}°C</Text>
            <Text>Sensação Térmica: {feelsLike}°C</Text>
            <Text>Umidade: {humidity}%</Text>
            <Text>Pressão: {pressure} hPa</Text>
            <Text>Nascer do Sol: {sunrise}</Text>
            <Text>Pôr do Sol: {sunset}</Text>
            <Text>Máxima: {maxTemp}°C</Text>
            <Text>Mínima: {minTemp}°C</Text>
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
    </ScrollView>
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
  weather: {
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

export default App;
