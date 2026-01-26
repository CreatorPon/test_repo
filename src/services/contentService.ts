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
  limit,
  GeoPoint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Content, ContentType, Location, SearchFilter } from '../types';
import { getListsContainingContent, removeContentFromList } from './listService';

// コンテンツを作成
export const createContent = async (
  userId: string,
  contentData: Omit<Content, 'id' | 'userId' | 'createdAt'>
): Promise<Content> => {
  const contentRef = await addDoc(collection(db, 'contents'), {
    ...contentData,
    userId,
    createdAt: Timestamp.now(),
  });

  const content: Content = {
    id: contentRef.id,
    userId,
    ...contentData,
    createdAt: Timestamp.now(),
  };

  return content;
};

// 画像をアップロード
export const uploadImage = async (
  userId: string,
  uri: string,
  fileName: string
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, `images/${userId}/${Date.now()}_${fileName}`);
  await uploadBytes(storageRef, blob);

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// ユーザーのコンテンツを取得
export const getUserContents = async (userId: string): Promise<Content[]> => {
  const q = query(
    collection(db, 'contents'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const contents: Content[] = [];

  querySnapshot.forEach((doc) => {
    contents.push({ id: doc.id, ...doc.data() } as Content);
  });

  return contents;
};

// コンテンツIDでコンテンツを取得
export const getContentById = async (contentId: string): Promise<Content | null> => {
  const docRef = doc(db, 'contents', contentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Content;
  }

  return null;
};

// コンテンツを更新
export const updateContent = async (
  contentId: string,
  updates: Partial<Content>
): Promise<void> => {
  const docRef = doc(db, 'contents', contentId);
  await updateDoc(docRef, updates);
};

// コンテンツを削除
export const deleteContent = async (contentId: string): Promise<void> => {
  const docRef = doc(db, 'contents', contentId);
  await deleteDoc(docRef);
};

// コンテンツを削除し、すべてのリストから削除
export const deleteContentWithCleanup = async (
  userId: string,
  contentId: string
): Promise<void> => {
  // コンテンツを含むすべてのリストを取得
  const listsContainingContent = await getListsContainingContent(userId, contentId);

  // すべてのリストからコンテンツを削除
  await Promise.all(
    listsContainingContent.map((list) => removeContentFromList(list.id, contentId))
  );

  // コンテンツ自体を削除
  await deleteContent(contentId);
};

// 検索フィルターに基づいてコンテンツを取得
export const searchContents = async (
  userId: string,
  filter: SearchFilter
): Promise<Content[]> => {
  let q = query(
    collection(db, 'contents'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  // コンテンツタイプでフィルター
  if (filter.contentType) {
    q = query(q, where('contentType', '==', filter.contentType));
  }

  const querySnapshot = await getDocs(q);
  let contents: Content[] = [];

  querySnapshot.forEach((doc) => {
    contents.push({ id: doc.id, ...doc.data() } as Content);
  });

  // キーワード検索（クライアント側でフィルター）
  if (filter.keyword) {
    const keyword = filter.keyword.toLowerCase();
    contents = contents.filter(
      (content) =>
        content.title.toLowerCase().includes(keyword) ||
        content.description?.toLowerCase().includes(keyword)
    );
  }

  // タグ検索（クライアント側でフィルター）
  if (filter.tags && filter.tags.length > 0) {
    contents = contents.filter((content) =>
      filter.tags!.some((tag) => content.tags.includes(tag))
    );
  }

  // 位置情報検索（クライアント側でフィルター）
  if (filter.location && filter.location.latitude && filter.location.longitude) {
    contents = contents.filter((content) => {
      if (!content.location) return false;

      const distance = calculateDistance(
        filter.location!.latitude,
        filter.location!.longitude,
        content.location.lat,
        content.location.lng
      );

      return distance <= filter.location!.radius;
    });
  }

  // カテゴリでフィルター
  if (filter.category) {
    contents = contents.filter(
      (content) => content.location?.category === filter.category
    );
  }

  return contents;
};

// 2点間の距離を計算（Haversine formula）
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// URLからOpen Graphメタデータを取得（簡易版）
export const fetchOGMetadata = async (url: string) => {
  try {
    // 実際のアプリでは、バックエンドAPIまたはサードパーティサービスを使用
    // ここでは簡易的な実装
    const response = await fetch(url);
    const html = await response.text();

    // 簡易的なOGタグのパース
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"\/>/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)"\/>/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"\/>/);

    return {
      title: titleMatch ? titleMatch[1] : '',
      description: descMatch ? descMatch[1] : '',
      image: imageMatch ? imageMatch[1] : '',
      url,
    };
  } catch (error) {
    console.error('Failed to fetch OG metadata:', error);
    return {
      title: url,
      description: '',
      image: '',
      url,
    };
  }
};
