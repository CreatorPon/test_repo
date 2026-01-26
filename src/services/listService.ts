import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { List, Visibility } from '../types';

// リストを作成
export const createList = async (
  userId: string,
  name: string,
  description?: string,
  visibility: Visibility = 'private'
): Promise<List> => {
  const listRef = await addDoc(collection(db, 'lists'), {
    userId,
    name,
    description: description || '',
    visibility,
    contentIds: [],
    coverImage: '',
    createdAt: Timestamp.now(),
  });

  const list: List = {
    id: listRef.id,
    userId,
    name,
    description: description || '',
    visibility,
    contentIds: [],
    coverImage: '',
    createdAt: Timestamp.now(),
  };

  return list;
};

// ユーザーのリストを取得
export const getUserLists = async (userId: string): Promise<List[]> => {
  const q = query(
    collection(db, 'lists'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const lists: List[] = [];

  querySnapshot.forEach((doc) => {
    lists.push({ id: doc.id, ...doc.data() } as List);
  });

  return lists;
};

// リストIDでリストを取得
export const getListById = async (listId: string): Promise<List | null> => {
  const docRef = doc(db, 'lists', listId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as List;
  }

  return null;
};

// リストを更新
export const updateList = async (
  listId: string,
  updates: Partial<List>
): Promise<void> => {
  const docRef = doc(db, 'lists', listId);
  await updateDoc(docRef, updates);
};

// リストを削除
export const deleteList = async (listId: string): Promise<void> => {
  const docRef = doc(db, 'lists', listId);
  await deleteDoc(docRef);
};

// リストにコンテンツを追加
export const addContentToList = async (
  listId: string,
  contentId: string
): Promise<void> => {
  const listDoc = await getListById(listId);
  if (!listDoc) throw new Error('List not found');

  const updatedContentIds = [...listDoc.contentIds, contentId];
  await updateList(listId, { contentIds: updatedContentIds });
};

// リストからコンテンツを削除
export const removeContentFromList = async (
  listId: string,
  contentId: string
): Promise<void> => {
  const listDoc = await getListById(listId);
  if (!listDoc) throw new Error('List not found');

  const updatedContentIds = listDoc.contentIds.filter((id) => id !== contentId);
  await updateList(listId, { contentIds: updatedContentIds });
};

// 特定のコンテンツを含むすべてのリストを取得
export const getListsContainingContent = async (
  userId: string,
  contentId: string
): Promise<List[]> => {
  const allLists = await getUserLists(userId);
  return allLists.filter((list) => list.contentIds.includes(contentId));
};

// 公開リストを取得（他のユーザーのリスト）
export const getPublicLists = async (userId?: string): Promise<List[]> => {
  let q = query(
    collection(db, 'lists'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc')
  );

  if (userId) {
    q = query(q, where('userId', '==', userId));
  }

  const querySnapshot = await getDocs(q);
  const lists: List[] = [];

  querySnapshot.forEach((doc) => {
    lists.push({ id: doc.id, ...doc.data() } as List);
  });

  return lists;
};
