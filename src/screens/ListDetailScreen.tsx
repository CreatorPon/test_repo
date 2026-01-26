import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ListsStackParamList, MainTabParamList, List, Content } from '../types';
import { getListById } from '../services/listService';
import { getContentById } from '../services/contentService';
import ContentCard from '../components/common/ContentCard';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { removeContentFromList } from '../store/slices/listSlice';

type ListDetailScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ListsStackParamList, 'ListDetail'>,
  BottomTabNavigationProp<MainTabParamList>
>;
type ListDetailScreenRouteProp = RouteProp<ListsStackParamList, 'ListDetail'>;

interface Props {
  navigation: ListDetailScreenNavigationProp;
  route: ListDetailScreenRouteProp;
}

const ListDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { listId } = route.params;
  const [list, setList] = useState<List | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListData();
  }, [listId]);

  const loadListData = async () => {
    try {
      const listData = await getListById(listId);
      if (listData) {
        setList(listData);

        const contentPromises = listData.contentIds.map((id) => getContentById(id));
        const contentResults = await Promise.all(contentPromises);
        setContents(contentResults.filter((c): c is Content => c !== null));
      }
    } catch (error) {
      console.error('Failed to load list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditList', { listId });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!list) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>リストが見つかりませんでした</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{list.name}</Text>
          <TouchableOpacity onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {list.description && (
          <Text style={styles.description}>{list.description}</Text>
        )}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="bookmark" size={16} color="#007AFF" />
            <Text style={styles.statText}>{list.contentIds.length}件</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name={list.visibility === 'public' ? 'globe' : 'lock-closed'}
              size={16}
              color="#666"
            />
            <Text style={styles.statText}>
              {list.visibility === 'public' ? '公開' : '非公開'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={contents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContentCard
            content={item}
            onPress={() =>
              navigation.navigate('Home', {
                screen: 'ContentDetail',
                params: { contentId: item.id },
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              まだコンテンツが追加されていません
            </Text>
          </View>
        }
      />
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ListDetailScreen;
