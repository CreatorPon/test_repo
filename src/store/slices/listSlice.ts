import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ListState, List, Visibility } from '../../types';
import * as listService from '../../services/listService';

const initialState: ListState = {
  lists: [],
  loading: false,
  error: null,
};

// 非同期アクション
export const fetchUserLists = createAsyncThunk(
  'list/fetchUserLists',
  async (userId: string) => {
    const lists = await listService.getUserLists(userId);
    return lists;
  }
);

export const createList = createAsyncThunk(
  'list/createList',
  async ({
    userId,
    name,
    description,
    visibility,
  }: {
    userId: string;
    name: string;
    description?: string;
    visibility?: Visibility;
  }) => {
    const list = await listService.createList(userId, name, description, visibility);
    return list;
  }
);

export const updateList = createAsyncThunk(
  'list/updateList',
  async ({ listId, updates }: { listId: string; updates: Partial<List> }) => {
    await listService.updateList(listId, updates);
    return { listId, updates };
  }
);

export const deleteList = createAsyncThunk(
  'list/deleteList',
  async (listId: string) => {
    await listService.deleteList(listId);
    return listId;
  }
);

export const addContentToList = createAsyncThunk(
  'list/addContentToList',
  async ({ listId, contentId }: { listId: string; contentId: string }) => {
    await listService.addContentToList(listId, contentId);
    return { listId, contentId };
  }
);

export const removeContentFromList = createAsyncThunk(
  'list/removeContentFromList',
  async ({ listId, contentId }: { listId: string; contentId: string }) => {
    await listService.removeContentFromList(listId, contentId);
    return { listId, contentId };
  }
);

// スライス
const listSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ユーザーのリスト取得
    builder.addCase(fetchUserLists.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserLists.fulfilled, (state, action) => {
      state.loading = false;
      state.lists = action.payload;
    });
    builder.addCase(fetchUserLists.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch lists';
    });

    // リスト作成
    builder.addCase(createList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createList.fulfilled, (state, action) => {
      state.loading = false;
      state.lists.unshift(action.payload);
    });
    builder.addCase(createList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create list';
    });

    // リスト更新
    builder.addCase(updateList.fulfilled, (state, action) => {
      const index = state.lists.findIndex((list) => list.id === action.payload.listId);
      if (index !== -1) {
        state.lists[index] = {
          ...state.lists[index],
          ...action.payload.updates,
        };
      }
    });

    // リスト削除
    builder.addCase(deleteList.fulfilled, (state, action) => {
      state.lists = state.lists.filter((list) => list.id !== action.payload);
    });

    // リストにコンテンツを追加
    builder.addCase(addContentToList.fulfilled, (state, action) => {
      const list = state.lists.find((list) => list.id === action.payload.listId);
      if (list) {
        list.contentIds.push(action.payload.contentId);
      }
    });

    // リストからコンテンツを削除
    builder.addCase(removeContentFromList.fulfilled, (state, action) => {
      const list = state.lists.find((list) => list.id === action.payload.listId);
      if (list) {
        list.contentIds = list.contentIds.filter(
          (id) => id !== action.payload.contentId
        );
      }
    });
  },
});

export const { clearError } = listSlice.actions;
export default listSlice.reducer;
