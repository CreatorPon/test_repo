import React, { useState, useEffect } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ListsStackParamList, Visibility, List } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { updateList, deleteList } from '../store/slices/listSlice';
import { getListById } from '../services/listService';

type EditListScreenNavigationProp = StackNavigationProp<
  ListsStackParamList,
  'EditList'
>;
type EditListScreenRouteProp = RouteProp<ListsStackParamList, 'EditList'>;

interface Props {
  navigation: EditListScreenNavigationProp;
  route: EditListScreenRouteProp;
}

const EditListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { listId } = route.params;
  const dispatch = useAppDispatch();

  const [list, setList] = useState<List | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadList();
  }, [listId]);

  const loadList = async () => {
    try {
      const listData = await getListById(listId);
      if (listData) {
        setList(listData);
        setName(listData.name);
        setDescription(listData.description || '');
        setVisibility(listData.visibility);
      }
    } catch (error) {
      console.error('Failed to load list:', error);
      Alert.alert('エラー', 'リストの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'リスト名を入力してください');
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateList({
          listId,
          updates: {
            name: name.trim(),
            description: description.trim(),
            visibility,
          },
        })
      ).unwrap();

      Alert.alert('成功', 'リストを更新しました');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'リストの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'リストを削除',
      'このリストを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteList(listId)).unwrap();
              Alert.alert('成功', 'リストを削除しました');
              navigation.navigate('ListsScreen');
            } catch (error: any) {
              Alert.alert('エラー', error.message || 'リストの削除に失敗しました');
            }
          },
        },
      ]
    );
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
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>更新</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>リストを削除</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  updateButton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default EditListScreen;
