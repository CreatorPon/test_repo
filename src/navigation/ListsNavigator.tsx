import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ListsStackParamList } from '../types';
import ListsScreen from '../screens/ListsScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import CreateListScreen from '../screens/CreateListScreen';
import EditListScreen from '../screens/EditListScreen';

const Stack = createStackNavigator<ListsStackParamList>();

const ListsNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ListsScreen"
        component={ListsScreen}
        options={{ headerTitle: 'リスト' }}
      />
      <Stack.Screen
        name="ListDetail"
        component={ListDetailScreen}
        options={{ headerTitle: 'リスト詳細' }}
      />
      <Stack.Screen
        name="CreateList"
        component={CreateListScreen}
        options={{ headerTitle: '新規リスト' }}
      />
      <Stack.Screen
        name="EditList"
        component={EditListScreen}
        options={{ headerTitle: 'リストを編集' }}
      />
    </Stack.Navigator>
  );
};

export default ListsNavigator;
