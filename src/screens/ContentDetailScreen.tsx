import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList, Content, List } from '../types';
import { getContentById } from '../services/contentService';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchUserLists, addContentToList, removeContentFromList } from '../store/slices/listSlice';

type ContentDetailScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'ContentDetail'
>;
type ContentDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ContentDetail'>;

interface Props {
  navigation: ContentDetailScreenNavigationProp;
  route: ContentDetailScreenRouteProp;
}

const ContentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contentId } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { lists } = useAppSelector((state) => state.list);

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadContent();
    if (user) {
      dispatch(fetchUserLists(user.uid));
    }
  }, [contentId, user]);

  // ヘッダーに「リストに追加」ボタンを設定
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="list" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadContent = async () => {
    try {
      const data = await getContentById(contentId);
      setContent(data);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUrl = () => {
    if (content?.sourceUrl) {
      Linking.openURL(content.sourceUrl);
    }
  };

  const isContentInList = (list: List) => {
    return list.contentIds.includes(contentId);
  };

  const handleToggleList = async (list: List) => {
    const inList = isContentInList(list);
    try {
      if (inList) {
        await dispatch(removeContentFromList({ listId: list.id, contentId })).unwrap();
      } else {
        await dispatch(addContentToList({ listId: list.id, contentId })).unwrap();
      }
      // リストを再取得
      if (user) {
        dispatch(fetchUserLists(user.uid));
      }
    } catch (error) {
      console.error('Failed to toggle list:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>コンテンツが見つかりませんでした</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {content.thumbnailUrl || content.fileUrl ? (
        <Image
          source={{ uri: content.thumbnailUrl || content.fileUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.content}>
        <View style={styles.typeContainer}>
          <Ionicons
            name={
              content.contentType === 'sns_post'
                ? 'share-social'
                : content.contentType === 'web_page'
                ? 'globe'
                : 'image'
            }
            size={20}
            color="#007AFF"
          />
          <Text style={styles.typeText}>
            {content.contentType === 'sns_post'
              ? 'SNS投稿'
              : content.contentType === 'web_page'
              ? 'ウェブページ'
              : '画像'}
          </Text>
        </View>

        <Text style={styles.title}>{content.title}</Text>

        {content.description && (
          <Text style={styles.description}>{content.description}</Text>
        )}

        {content.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>タグ</Text>
            <View style={styles.tagsContainer}>
              {content.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {content.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>位置情報</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{content.location.name}</Text>
                {content.location.category && (
                  <Text style={styles.locationCategory}>
                    {content.location.category}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {content.sourceUrl && (
          <TouchableOpacity style={styles.urlButton} onPress={handleOpenUrl}>
            <Ionicons name="open-outline" size={20} color="#007AFF" />
            <Text style={styles.urlButtonText}>元のURLを開く</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* リスト管理モーダル */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>リストに追加/削除</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={lists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => handleToggleList(item)}
                >
                  <View style={styles.listItemLeft}>
                    <Ionicons
                      name={item.visibility === 'public' ? 'globe' : 'lock-closed'}
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.listItemText}>{item.name}</Text>
                  </View>
                  <Ionicons
                    name={
                      isContentInList(item)
                        ? 'checkmark-circle'
                        : 'checkmark-circle-outline'
                    }
                    size={24}
                    color={isContentInList(item) ? '#007AFF' : '#ccc'}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="list-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyListText}>
                    リストがありません
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationInfo: {
    marginLeft: 8,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  locationCategory: {
    fontSize: 14,
    color: '#666',
  },
  urlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  urlButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyListText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});

export default ContentDetailScreen;
