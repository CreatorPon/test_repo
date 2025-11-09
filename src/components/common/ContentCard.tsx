import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Content } from '../../types';

interface Props {
  content: Content;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const ContentCard: React.FC<Props> = ({ content, onPress }) => {
  const getContentIcon = () => {
    switch (content.contentType) {
      case 'sns_post':
        return 'share-social';
      case 'web_page':
        return 'globe';
      case 'image':
        return 'image';
      default:
        return 'document';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {content.thumbnailUrl ? (
        <Image source={{ uri: content.thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={styles.noThumbnail}>
          <Ionicons name={getContentIcon()} size={40} color="#ccc" />
        </View>
      )}

      <View style={styles.contentInfo}>
        <View style={styles.header}>
          <Ionicons name={getContentIcon()} size={16} color="#666" />
          <Text style={styles.contentType}>
            {content.contentType === 'sns_post'
              ? 'SNS投稿'
              : content.contentType === 'web_page'
              ? 'ウェブページ'
              : '画像'}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>

        {content.description && (
          <Text style={styles.description} numberOfLines={2}>
            {content.description}
          </Text>
        )}

        {content.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {content.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {content.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#007AFF" />
            <Text style={styles.locationText}>{content.location.name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  noThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentType: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
});

export default ContentCard;
