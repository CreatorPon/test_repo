import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import * as authService from '../../services/authService';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// 非同期アクション
export const signUpWithEmail = createAsyncThunk(
  'auth/signUpWithEmail',
  async ({
    email,
    password,
    displayName,
  }: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    const user = await authService.signUpWithEmail(email, password, displayName);
    return user;
  }
);

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    const user = await authService.signInWithEmail(email, password);
    return user;
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (idToken: string) => {
    const user = await authService.signInWithGoogle(idToken);
    return user;
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await authService.signOut();
});

// スライス
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // サインアップ
    builder.addCase(signUpWithEmail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUpWithEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(signUpWithEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to sign up';
    });

    // サインイン（メール）
    builder.addCase(signInWithEmail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signInWithEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(signInWithEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to sign in';
    });

    // サインイン（Google）
    builder.addCase(signInWithGoogle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signInWithGoogle.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(signInWithGoogle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to sign in with Google';
    });

    // サインアウト
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
    });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
