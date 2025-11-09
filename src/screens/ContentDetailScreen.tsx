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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList, Content } from '../types';
import { getContentById } from '../services/contentService';

type ContentDetailScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'ContentDetail'
>;
type ContentDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ContentDetail'>;

interface Props {
  navigation: ContentDetailScreenNavigationProp;
  route: ContentDetailScreenRouteProp;
}

const ContentDetailScreen: React.FC<Props> = ({ route }) => {
  const { contentId } = route.params;
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [contentId]);

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
});

export default ContentDetailScreen;
