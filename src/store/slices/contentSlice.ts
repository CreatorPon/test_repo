import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentState, Content, SearchFilter } from '../../types';
import * as contentService from '../../services/contentService';

const initialState: ContentState = {
  contents: [],
  loading: false,
  error: null,
};

// 非同期アクション
export const fetchUserContents = createAsyncThunk(
  'content/fetchUserContents',
  async (userId: string) => {
    const contents = await contentService.getUserContents(userId);
    return contents;
  }
);

export const createContent = createAsyncThunk(
  'content/createContent',
  async ({
    userId,
    contentData,
  }: {
    userId: string;
    contentData: Omit<Content, 'id' | 'userId' | 'createdAt'>;
  }) => {
    const content = await contentService.createContent(userId, contentData);
    return content;
  }
);

export const updateContent = createAsyncThunk(
  'content/updateContent',
  async ({
    contentId,
    updates,
  }: {
    contentId: string;
    updates: Partial<Content>;
  }) => {
    await contentService.updateContent(contentId, updates);
    return { contentId, updates };
  }
);

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (contentId: string) => {
    await contentService.deleteContent(contentId);
    return contentId;
  }
);

export const deleteContentWithCleanup = createAsyncThunk(
  'content/deleteContentWithCleanup',
  async ({ userId, contentId }: { userId: string; contentId: string }) => {
    await contentService.deleteContentWithCleanup(userId, contentId);
    return contentId;
  }
);

export const searchContents = createAsyncThunk(
  'content/searchContents',
  async ({ userId, filter }: { userId: string; filter: SearchFilter }) => {
    const contents = await contentService.searchContents(userId, filter);
    return contents;
  }
);

// スライス
const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addContent: (state, action: PayloadAction<Content>) => {
      state.contents.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // ユーザーのコンテンツ取得
    builder.addCase(fetchUserContents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserContents.fulfilled, (state, action) => {
      state.loading = false;
      state.contents = action.payload;
    });
    builder.addCase(fetchUserContents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch contents';
    });

    // コンテンツ作成
    builder.addCase(createContent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createContent.fulfilled, (state, action) => {
      state.loading = false;
      state.contents.unshift(action.payload);
    });
    builder.addCase(createContent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create content';
    });

    // コンテンツ更新
    builder.addCase(updateContent.fulfilled, (state, action) => {
      const index = state.contents.findIndex(
        (content) => content.id === action.payload.contentId
      );
      if (index !== -1) {
        state.contents[index] = {
          ...state.contents[index],
          ...action.payload.updates,
        };
      }
    });

    // コンテンツ削除
    builder.addCase(deleteContent.fulfilled, (state, action) => {
      state.contents = state.contents.filter(
        (content) => content.id !== action.payload
      );
    });

    // コンテンツ削除（クリーンアップ付き）
    builder.addCase(deleteContentWithCleanup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteContentWithCleanup.fulfilled, (state, action) => {
      state.loading = false;
      state.contents = state.contents.filter(
        (content) => content.id !== action.payload
      );
    });
    builder.addCase(deleteContentWithCleanup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete content';
    });

    // コンテンツ検索
    builder.addCase(searchContents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchContents.fulfilled, (state, action) => {
      state.loading = false;
      state.contents = action.payload;
    });
    builder.addCase(searchContents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to search contents';
    });
  },
});

export const { clearError, addContent } = contentSlice.actions;
export default contentSlice.reducer;
