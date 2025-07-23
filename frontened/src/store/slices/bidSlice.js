import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuctionDetail } from "./auctionSlice";

const bidSlice = createSlice({
  name: "bid",
  initialState: {
    loading: false,
  },
  reducers: {
    bidRequest(state) {
      state.loading = true;
    },
    bidSuccess(state) {
      state.loading = false;
    },
    bidFailed(state) {
      state.loading = false;
    },
  },
});

// ✅ Updated backend base URL
const BACKEND_BASE_URL = "https://auction-platform-backend-ilqi.onrender.com";

export const placeBid = (id, data) => async (dispatch) => {
  dispatch(bidSlice.actions.bidRequest());
  try {
    const response = await axios.post(
      `${BACKEND_BASE_URL}/api/v1/bid/place/${id}`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    dispatch(bidSlice.actions.bidSuccess());
    toast.success(response.data.message);
    dispatch(getAuctionDetail(id));
  } catch (error) {
    dispatch(bidSlice.actions.bidFailed());
    toast.error(error?.response?.data?.message || "Failed to place bid");
  }
};

export default bidSlice.reducer;
