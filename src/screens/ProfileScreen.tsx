import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../types';
import { useAppSelector } from '../hooks/useAppSelector';

type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'ProfileScreen'
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { contents } = useAppSelector((state) => state.content);
  const { lists } = useAppSelector((state) => state.list);

  const getCategoryStats = () => {
    const categories: { [key: string]: number } = {};

    contents.forEach((content) => {
      if (content.location?.category) {
        categories[content.location.category] =
          (categories[content.location.category] || 0) + 1;
      }
    });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const categoryStats = getCategoryStats();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
          )}
        </View>

        <Text style={styles.displayName}>{user?.displayName || 'ユーザー'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={20} color="#007AFF" />
          <Text style={styles.settingsButtonText}>設定</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{contents.length}</Text>
          <Text style={styles.statLabel}>コンテンツ</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{lists.length}</Text>
          <Text style={styles.statLabel}>リスト</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {contents.filter((c) => c.location).length}
          </Text>
          <Text style={styles.statLabel}>位置情報付き</Text>
        </View>
      </View>

      {categoryStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>よく保存するカテゴリ</Text>
          {categoryStats.map(([category, count]) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category}</Text>
              <View style={styles.categoryCount}>
                <Text style={styles.categoryCountText}>{count}件</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>コンテンツタイプ別</Text>
        <View style={styles.typeStats}>
          <View style={styles.typeItem}>
            <Ionicons name="globe" size={24} color="#007AFF" />
            <Text style={styles.typeLabel}>ウェブページ</Text>
            <Text style={styles.typeCount}>
              {contents.filter((c) => c.contentType === 'web_page').length}件
            </Text>
          </View>

          <View style={styles.typeItem}>
            <Ionicons name="share-social" size={24} color="#007AFF" />
            <Text style={styles.typeLabel}>SNS投稿</Text>
            <Text style={styles.typeCount}>
              {contents.filter((c) => c.contentType === 'sns_post').length}件
            </Text>
          </View>

          <View style={styles.typeItem}>
            <Ionicons name="image" size={24} color="#007AFF" />
            <Text style={styles.typeLabel}>画像</Text>
            <Text style={styles.typeCount}>
              {contents.filter((c) => c.contentType === 'image').length}件
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 20,
  },
  settingsButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryCount: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCountText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  typeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  typeItem: {
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  typeCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ProfileScreen;
