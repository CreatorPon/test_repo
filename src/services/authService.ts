import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

// Google認証プロバイダー
const googleProvider = new GoogleAuthProvider();

// メールアドレスでサインアップ
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // プロフィール更新
  await updateProfile(firebaseUser, { displayName });

  // Firestoreにユーザー情報を保存
  const user: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: displayName,
    photoURL: firebaseUser.photoURL || '',
    createdAt: Timestamp.now(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), user);

  return user;
};

// メールアドレスでログイン
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Firestoreからユーザー情報を取得
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }

  // Firestoreにデータがない場合は作成
  const user: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || '',
    createdAt: Timestamp.now(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), user);

  return user;
};

// Googleでサインイン（トークンを使用）
export const signInWithGoogle = async (idToken: string): Promise<User> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const firebaseUser = userCredential.user;

  // Firestoreからユーザー情報を取得または作成
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (userDoc.exists()) {
    return userDoc.data() as User;
  }

  // 新規ユーザーの場合はFirestoreに保存
  const user: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || '',
    createdAt: Timestamp.now(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), user);

  return user;
};

// サインアウト
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// 現在のユーザー情報を取得
export const getCurrentUser = async (
  firebaseUser: FirebaseUser
): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};
