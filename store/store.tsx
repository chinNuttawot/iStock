import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "./slices/filterSlice";

const reducer = {
  filter: filterReducer,
};
export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false, // ✅ ปิด immutable check
    }),
});
