import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ListsStackParamList } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchUserLists } from '../store/slices/listSlice';

type ListsScreenNavigationProp = StackNavigationProp<
  ListsStackParamList,
  'ListsScreen'
>;

interface Props {
  navigation: ListsScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ListsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { lists, loading } = useAppSelector((state) => state.list);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserLists(user.uid));
    }
  }, [user, dispatch]);

  const onRefresh = React.useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await dispatch(fetchUserLists(user.uid));
      setRefreshing(false);
    }
  }, [user, dispatch]);

  const handleCreateList = () => {
    navigation.navigate('CreateList');
  };

  const handleListPress = (listId: string) => {
    navigation.navigate('ListDetail', { listId });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listCard}
            onPress={() => handleListPress(item.id)}
          >
            <View style={styles.listCardContent}>
              <View style={styles.listHeader}>
                <Ionicons
                  name={item.visibility === 'public' ? 'globe' : 'lock-closed'}
                  size={16}
                  color="#666"
                />
              </View>

              <Text style={styles.listTitle} numberOfLines={2}>
                {item.name}
              </Text>

              {item.description && (
                <Text style={styles.listDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.listFooter}>
                <Ionicons name="bookmark" size={16} color="#007AFF" />
                <Text style={styles.listCount}>{item.contentIds.length}件</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>まだリストがありません</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateList}
            >
              <Text style={styles.createButtonText}>リストを作成</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {lists.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCreateList}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  listCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listCardContent: {
    padding: 16,
  },
  listHeader: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  listDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCount: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ListsScreen;
