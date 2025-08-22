// store/slices/filterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FilterState = {
    docNo: string;
    documentDate: string;
    status: string;
    isFilter: boolean;
};

const initialState: FilterState = {
    docNo: "",
    documentDate: "",
    status: "All",
    isFilter: false
};

export const filterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
            return { ...state, ...action.payload };
        },
        resetFilter: () => initialState,
    },
});

export const { setFilter, resetFilter } = filterSlice.actions;
export default filterSlice.reducer;
