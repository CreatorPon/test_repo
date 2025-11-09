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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ListsStackParamList, Visibility } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { createList } from '../store/slices/listSlice';

type CreateListScreenNavigationProp = StackNavigationProp<
  ListsStackParamList,
  'CreateList'
>;

interface Props {
  navigation: CreateListScreenNavigationProp;
}

const CreateListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }

    if (!name.trim()) {
      Alert.alert('エラー', 'リスト名を入力してください');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createList({
          userId: user.uid,
          name: name.trim(),
          description: description.trim(),
          visibility,
        })
      ).unwrap();

      Alert.alert('成功', 'リストを作成しました');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'リストの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>リスト名 *</Text>
        <TextInput
          style={styles.input}
          placeholder="リスト名を入力"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>説明</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="説明を入力（任意）"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>公開設定</Text>
        <View style={styles.visibilityContainer}>
          <TouchableOpacity
            style={[
              styles.visibilityButton,
              visibility === 'private' && styles.visibilityButtonActive,
            ]}
            onPress={() => setVisibility('private')}
          >
            <Ionicons
              name="lock-closed"
              size={20}
              color={visibility === 'private' ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.visibilityText,
                visibility === 'private' && styles.visibilityTextActive,
              ]}
            >
              非公開
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.visibilityButton,
              visibility === 'public' && styles.visibilityButtonActive,
            ]}
            onPress={() => setVisibility('public')}
          >
            <Ionicons
              name="globe"
              size={20}
              color={visibility === 'public' ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.visibilityText,
                visibility === 'public' && styles.visibilityTextActive,
              ]}
            >
              公開
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>作成</Text>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
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
  visibilityContainer: {
    flexDirection: 'row',
  },
  visibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  visibilityButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  visibilityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  visibilityTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  createButton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateListScreen;
