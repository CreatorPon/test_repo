import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contentReducer from './slices/contentSlice';
import listReducer from './slices/listSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    list: listReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Firebase Timestampの非シリアライズ可能なデータを無視
        ignoredActions: [
          'auth/signUpWithEmail/fulfilled',
          'auth/signInWithEmail/fulfilled',
          'auth/signInWithGoogle/fulfilled',
          'auth/setUser',
        ],
        ignoredPaths: ['auth.user.createdAt', 'content.contents', 'list.lists'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
