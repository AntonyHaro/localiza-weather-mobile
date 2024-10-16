import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CepSearchScreen from './screens/CepSearchScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CepSearch">
        <Stack.Screen name="CepSearch" component={CepSearchScreen} options={{ title: 'Consulta de CEP' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Histórico de Consultas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

