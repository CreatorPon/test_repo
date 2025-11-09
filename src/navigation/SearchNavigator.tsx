import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SearchTabParamList } from '../types';
import KeywordSearchScreen from '../screens/KeywordSearchScreen';
import MapSearchScreen from '../screens/MapSearchScreen';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator<SearchTabParamList>();

const SearchNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        }}
      >
        <Tab.Screen
          name="KeywordSearch"
          component={KeywordSearchScreen}
          options={{ tabBarLabel: 'キーワード' }}
        />
        <Tab.Screen
          name="MapSearch"
          component={MapSearchScreen}
          options={{ tabBarLabel: 'マップ' }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SearchNavigator;
