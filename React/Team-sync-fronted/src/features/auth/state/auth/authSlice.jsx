import {createSlice} from '@reduxjs/toolkit';

let authSlice = createSlice({
  name: 'auth',
  initialState: {   
    employee: null,
    isFileLoading: false,
  },
    reducers: {
        addEmployee: (state, action) => {
            state.employee = action.payload;
            state.isFileLoading = false;
        },

    removeEmployee: (state) => {
            state.employee = null;
            state.isFileLoading = false;
        }
    }
});

export const {addEmployee, removeEmployee} = authSlice.actions;
export default authSlice.reducer;