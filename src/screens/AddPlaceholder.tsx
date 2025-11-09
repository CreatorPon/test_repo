import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddPlaceholder: React.FC = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="add-circle-outline" size={80} color="#ccc" />
      <Text style={styles.title}>コンテンツの追加</Text>
      <Text style={styles.message}>
        この機能はデモモードでは使用できません
      </Text>
      <Text style={styles.hint}>
        実際のFirebase設定を行うと、URL・画像の保存が可能になります
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AddPlaceholder;
