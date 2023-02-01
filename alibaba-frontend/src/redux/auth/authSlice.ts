import { toast } from 'react-toastify';
import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { extendedApiSlice } from 'redux/endpoints/auth';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user') as string) ?? null,
    token: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(extendedApiSlice.endpoints.login.matchFulfilled, (state, action) => {
        let data = action.payload;
        localStorage.setItem('user', JSON.stringify(data));

        data = {
          token: data.token,
          ...data.user
        };

        state.user = data;
        state.token = data.token;
      })
      .addMatcher(extendedApiSlice.endpoints.login.matchRejected, (_, action: any) => {
        toast.error(action?.payload?.data?.detail || action?.error?.message || 'Some error occurred', {
          autoClose: 3000
        });
      });
  }
});

export const { setUser, setToken } = authSlice.actions;
export const authSelector = (state: RootState) => state.auth;
export default authSlice.reducer;
