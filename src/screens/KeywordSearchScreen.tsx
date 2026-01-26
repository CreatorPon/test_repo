import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { searchContents } from '../store/slices/contentSlice';
import ContentCard from '../components/common/ContentCard';
import { ContentType, SearchTabParamList, MainTabParamList } from '../types';

type KeywordSearchNavigationProp = CompositeNavigationProp<
  MaterialTopTabNavigationProp<SearchTabParamList, 'KeywordSearch'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const CONTENT_TYPES: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'web_page', label: 'ウェブページ' },
  { value: 'sns_post', label: 'SNS投稿' },
  { value: 'image', label: '画像' },
];

const KeywordSearchScreen: React.FC = () => {
  const navigation = useNavigation<KeywordSearchNavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { contents, loading } = useAppSelector((state) => state.content);

  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [searchTags, setSearchTags] = useState('');

  const handleSearch = async () => {
    if (!user) return;

    const tagsArray = searchTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await dispatch(
      searchContents({
        userId: user.uid,
        filter: {
          keyword: keyword || undefined,
          contentType: selectedType === 'all' ? undefined : selectedType,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        },
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="キーワードで検索"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tagsInputContainer}>
          <Ionicons name="pricetag" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="タグで検索（カンマ区切り）"
            value={searchTags}
            onChangeText={setSearchTags}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        <View style={styles.typeFilters}>
          {CONTENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                selectedType === type.value && styles.typeButtonActive,
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === type.value && styles.typeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>検索</Text>
            </>
          )}
        </TouchableOpacity>
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
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {keyword || searchTags
                ? '検索結果が見つかりませんでした'
                : 'キーワードまたはタグを入力して検索してください'}
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
  searchSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  typeFilters: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  searchButton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default KeywordSearchScreen;
