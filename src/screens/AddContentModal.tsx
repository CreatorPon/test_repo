import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { createContent } from '../store/slices/contentSlice';
import { uploadImage, fetchOGMetadata } from '../services/contentService';
import { ContentType, Location as LocationType } from '../types';
import { Timestamp } from 'firebase/firestore';

const AddContentModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [contentType, setContentType] = useState<ContentType>('web_page');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState<LocationType | null>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', '画像にアクセスする権限が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setContentType('image');
      if (!title) {
        setTitle('画像');
      }
    }
  };

  const handleFetchMetadata = async () => {
    if (!url) {
      Alert.alert('エラー', 'URLを入力してください');
      return;
    }

    setLoading(true);
    try {
      const metadata = await fetchOGMetadata(url);
      if (metadata.title) setTitle(metadata.title);
      if (metadata.description) setDescription(metadata.description);
      if (metadata.image) setThumbnailUrl(metadata.image);
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      Alert.alert('エラー', 'メタデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', '位置情報にアクセスする権限が必要です');
      return;
    }

    setLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode[0]) {
        const address = `${geocode[0].city || ''} ${geocode[0].street || ''}`;
        setLocationName(address);
        setLocation({
          lat: latitude,
          lng: longitude,
          name: address,
        });
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('エラー', '位置情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }

    if (!title) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    setLoading(true);
    try {
      let fileUrl = '';

      if (imageUri) {
        fileUrl = await uploadImage(user.uid, imageUri, 'image.jpg');
      }

      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await dispatch(
        createContent({
          userId: user.uid,
          contentData: {
            contentType,
            sourceUrl: url || undefined,
            title,
            description: description || undefined,
            thumbnailUrl: thumbnailUrl || undefined,
            fileUrl: fileUrl || undefined,
            tags: tagsArray,
            location: location || undefined,
            createdAt: Timestamp.now(),
          },
        })
      ).unwrap();

      Alert.alert('成功', 'コンテンツを保存しました');
      resetForm();
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'コンテンツの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContentType('web_page');
    setUrl('');
    setTitle('');
    setDescription('');
    setThumbnailUrl('');
    setImageUri('');
    setTags('');
    setLocation(null);
    setLocationName('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>コンテンツタイプ</Text>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              contentType === 'web_page' && styles.typeButtonActive,
            ]}
            onPress={() => setContentType('web_page')}
          >
            <Ionicons
              name="globe"
              size={20}
              color={contentType === 'web_page' ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.typeButtonText,
                contentType === 'web_page' && styles.typeButtonTextActive,
              ]}
            >
              ウェブページ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              contentType === 'sns_post' && styles.typeButtonActive,
            ]}
            onPress={() => setContentType('sns_post')}
          >
            <Ionicons
              name="share-social"
              size={20}
              color={contentType === 'sns_post' ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.typeButtonText,
                contentType === 'sns_post' && styles.typeButtonTextActive,
              ]}
            >
              SNS投稿
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              contentType === 'image' && styles.typeButtonActive,
            ]}
            onPress={() => setContentType('image')}
          >
            <Ionicons
              name="image"
              size={20}
              color={contentType === 'image' ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.typeButtonText,
                contentType === 'image' && styles.typeButtonTextActive,
              ]}
            >
              画像
            </Text>
          </TouchableOpacity>
        </View>

        {contentType !== 'image' && (
          <>
            <Text style={styles.sectionTitle}>URL</Text>
            <View style={styles.urlInputContainer}>
              <TextInput
                style={styles.urlInput}
                placeholder="https://example.com"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.fetchButton}
                onPress={handleFetchMetadata}
                disabled={loading}
              >
                <Ionicons name="download-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {contentType === 'image' && (
          <>
            <Text style={styles.sectionTitle}>画像</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handlePickImage}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePickerContent}>
                  <Ionicons name="image-outline" size={40} color="#007AFF" />
                  <Text style={styles.imagePickerText}>画像を選択</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.sectionTitle}>タイトル *</Text>
        <TextInput
          style={styles.input}
          placeholder="タイトルを入力"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.sectionTitle}>説明</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="説明を入力"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>タグ（カンマ区切り）</Text>
        <TextInput
          style={styles.input}
          placeholder="例: カフェ, 東京, おすすめ"
          value={tags}
          onChangeText={setTags}
        />

        <Text style={styles.sectionTitle}>位置情報</Text>
        {location ? (
          <View style={styles.locationDisplay}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.locationText}>{locationName}</Text>
            <TouchableOpacity onPress={() => setLocation(null)}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleGetCurrentLocation}
            disabled={loading}
          >
            <Ionicons name="navigate-outline" size={20} color="#007AFF" />
            <Text style={styles.locationButtonText}>現在地を取得</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  fetchButton: {
    marginLeft: 8,
    padding: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007AFF',
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddContentModal;
