import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const commissionSlice = createSlice({
  name: "commission",
  initialState: {
    loading: false,
  },
  reducers: {
    postCommissionProofRequest(state) {
      state.loading = true;
    },
    postCommissionProofSuccess(state) {
      state.loading = false;
    },
    postCommissionProofFailed(state) {
      state.loading = false;
    },
  },
});

// ✅ Updated backend URI here
const BACKEND_BASE_URL = "https://auction-platform-backend-hkp6.onrender.com";

export const postCommissionProof = (data) => async (dispatch) => {
  dispatch(commissionSlice.actions.postCommissionProofRequest());
  try {
    const response = await axios.post(
      `${BACKEND_BASE_URL}/api/v1/commission/proof`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    dispatch(commissionSlice.actions.postCommissionProofSuccess());
    toast.success(response.data.message);
  } catch (error) {
    dispatch(commissionSlice.actions.postCommissionProofFailed());
    toast.error(error?.response?.data?.message || "Something went wrong");
  }
};

export default commissionSlice.reducer;
