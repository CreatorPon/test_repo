import { Timestamp } from 'firebase/firestore';

// ユーザー型
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
}

// 位置情報型
export interface Location {
  lat: number;
  lng: number;
  name: string;
  category?: string;
}

// コンテンツタイプ
export type ContentType = 'sns_post' | 'web_page' | 'image';

// コンテンツ型
export interface Content {
  id: string;
  userId: string;
  contentType: ContentType;
  sourceUrl?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  tags: string[];
  location?: Location;
  createdAt: Timestamp;
}

// リストの公開設定
export type Visibility = 'private' | 'public';

// リスト型
export interface List {
  id: string;
  userId: string;
  name: string;
  description?: string;
  visibility: Visibility;
  contentIds: string[];
  coverImage?: string;
  createdAt: Timestamp;
}

// ナビゲーション型定義
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Add: undefined;
  Lists: undefined;
  Profile: undefined;
};

export type SearchTabParamList = {
  KeywordSearch: undefined;
  MapSearch: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ContentDetail: { contentId: string };
};

export type ListsStackParamList = {
  ListsScreen: undefined;
  ListDetail: { listId: string };
  CreateList: undefined;
  EditList: { listId: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
};

// Redux State型
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface ContentState {
  contents: Content[];
  loading: boolean;
  error: string | null;
}

export interface ListState {
  lists: List[];
  loading: boolean;
  error: string | null;
}

// Open Graph メタデータ型
export interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

// 検索フィルター型
export interface SearchFilter {
  keyword?: string;
  tags?: string[];
  contentType?: ContentType;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
  category?: string;
}
