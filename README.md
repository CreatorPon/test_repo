# ブックマークマップアプリ

SNS投稿・ウェブページ・画像を一元管理し、**地図上で位置情報検索**できるブックマークアプリです。保存したコンテンツが「好きなものプロフィール」として機能します。

## 主な機能

### 🔐 認証
- Firebase Authによるメール認証
- Google/Apple認証対応（将来拡張可能）
- ユーザープロフィール管理

### 📝 コンテンツ保存
- URL入力でSNS投稿/ウェブページを保存
- 画像の直接アップロード（最大10MB）
- Open Graphでメタデータ自動取得
- タグによる分類
- 位置情報の保存

### 📋 リスト管理
- リストのCRUD操作
- リストの公開/非公開設定
- リスト詳細表示

### 🔍 検索機能
**キーワード検索:**
- テキスト・タグ・コンテンツタイプでの絞り込み

**マップ検索（最重要機能）:**
- 保存済みコンテンツを地図上にピン表示
- 現在地周辺のコンテンツ検索
- カテゴリフィルター
- ピンタップで詳細表示

### 👤 プロフィール
- ユーザーのリスト一覧
- 保存カテゴリの自動分析
- コンテンツタイプ別統計

## 技術スタック

- **フロントエンド**: React Native + TypeScript + Expo
- **バックエンド**: Firebase (Firestore, Auth, Storage)
- **マップ**: Google Maps API (react-native-maps)
- **状態管理**: Redux Toolkit
- **ナビゲーション**: React Navigation

## セットアップ手順

### 1. 必要な環境

- Node.js 18以上
- npm または yarn
- Expo CLI
- Firebase プロジェクト
- Google Maps API キー

### 2. インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd bookmark-map-app

# 依存関係をインストール
npm install
```

### 3. Firebaseプロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成
2. Firebase Authenticationを有効化（メール/パスワード、Google）
3. Firestoreデータベースを作成
4. Firebase Storageを有効化
5. プロジェクト設定から設定情報を取得

### 4. Google Maps APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Maps SDK for Android/iOSを有効化
3. APIキーを作成

### 5. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、以下の情報を入力：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

`app.json`のGoogle Maps APIキーも更新してください。

### 6. Firestoreセキュリティルールの設定

Firebase Consoleで以下のセキュリティルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // コンテンツコレクション
    match /contents/{contentId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // リストコレクション
    match /lists/{listId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      resource.data.visibility == 'public');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 7. Storageセキュリティルールの設定

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024; // 10MB制限
    }
  }
}
```

### 8. アプリの起動

```bash
# Expoサーバーを起動
npm start

# iOSシミュレーターで起動
npm run ios

# Androidエミュレーターで起動
npm run android
```

## プロジェクト構造

```
bookmark-map-app/
├── src/
│   ├── components/        # 共通コンポーネント
│   │   ├── common/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── search/
│   │   ├── content/
│   │   ├── lists/
│   │   └── profile/
│   ├── screens/          # 画面コンポーネント
│   ├── navigation/       # ナビゲーション設定
│   ├── store/            # Redux store
│   │   └── slices/       # Redux slices
│   ├── services/         # Firebase/API サービス
│   ├── types/            # TypeScript型定義
│   ├── utils/            # ユーティリティ関数
│   └── hooks/            # カスタムフック
├── App.tsx               # アプリエントリーポイント
├── app.json              # Expo設定
├── package.json
└── tsconfig.json
```

## データベース構造

### users コレクション
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: timestamp;
}
```

### contents コレクション
```typescript
{
  id: string;
  userId: string;
  contentType: 'sns_post' | 'web_page' | 'image';
  sourceUrl?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  tags: string[];
  location?: {
    lat: number;
    lng: number;
    name: string;
    category?: string;
  };
  createdAt: timestamp;
}
```

### lists コレクション
```typescript
{
  id: string;
  userId: string;
  name: string;
  description?: string;
  visibility: 'private' | 'public';
  contentIds: string[];
  coverImage?: string;
  createdAt: timestamp;
}
```

## 画面構成

### ボトムナビゲーション（5タブ）
1. **ホーム** - 保存したコンテンツのフィード表示
2. **検索** - キーワード/マップの2タブ検索
3. **追加** - コンテンツ保存モーダル
4. **リスト一覧** - 作成したリストの管理
5. **プロフィール** - ユーザー情報と統計

## 重要な実装ポイント

1. **マップ検索機能**
   - react-native-mapsを使用
   - 位置情報の許可取得
   - カテゴリフィルター実装

2. **Firebase無料枠内での動作**
   - 読み取り/書き込み回数の最適化
   - ストレージ使用量の制限（画像10MB以下）

3. **iOS/Android両対応**
   - Expoで統一的に管理
   - プラットフォーム固有の設定はapp.jsonで管理

## トラブルシューティング

### Google Maps が表示されない
- app.jsonのAPIキーが正しく設定されているか確認
- Google Cloud ConsoleでMaps SDK for Android/iOSが有効化されているか確認

### Firebase接続エラー
- .envファイルの設定値が正しいか確認
- Firebaseコンソールでプロジェクトが有効か確認

### 位置情報が取得できない
- iOS: Info.plistに位置情報の使用許可設定が必要
- Android: AndroidManifest.xmlに位置情報の権限設定が必要
- Expoの場合、app.jsonのpluginsセクションで設定済み

## 今後の拡張機能

- [ ] SNS共有機能
- [ ] コンテンツのエクスポート機能
- [ ] 他のユーザーのリストをフォロー
- [ ] プッシュ通知
- [ ] ダークモード対応
- [ ] オフライン対応

## ライセンス

MIT License

## お問い合わせ

問題が発生した場合は、GitHubのIssuesでご報告ください。
