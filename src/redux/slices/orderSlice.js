import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiConfig";
import { message } from "antd";

// const returnUrl = "http://localhost:5173/checkout-process-order";

const returnUrl = "https://fe-capstone-io-ts.vercel.app/checkout-process-order";
const handleAsyncState = (builder, asyncThunk, onSuccess) => {
  builder
    .addCase(asyncThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(asyncThunk.fulfilled, (state, action) => {
      state.loading = false;
      onSuccess?.(state, action);
    })
    .addCase(asyncThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
};

export const createOrder = createAsyncThunk(
  "createOrders/createOrder",
  async (
    {
      address,
      contactNumber,
      notes,
      provinceId,
      districtId,
      wardId,
      addressId,
      deliver_option,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/Order/create-order?returnUrl=${encodeURIComponent(returnUrl)}`,
        {
          address,
          contactNumber,
          notes,
          provinceId,
          districtId,
          wardId,
          addressId,
          deliver_option,
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.errors ||
            error.response.data.message ||
            "Something went wrong"
        );
      }
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);
export const checkSuccessOrder = createAsyncThunk(
  "createOrders/checkSuccessOrder",
  async ({ urlResponse }, { rejectWithValue }) => {
    console.log("ff", urlResponse);

    try {
      const response = await api.post(`/api/Order/check-order-success`, {
        urlResponse,
      });
      message.success(response.data.message);
      return response.data;
    } catch (error) {
      message.warning("warning", error);
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);
export const getfeeShip = createAsyncThunk(
  "createOrders/getfeeShip",
  async (
    { provinceId, wardId, districtId, addressId, address, deliver_option },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/api/Shipping/get-fee`, {
        provinceId,
        wardId,
        districtId,
        addressId,
        address,
        deliver_option,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.errors ||
            error.response.data.message ||
            "Something went wrong"
        );
      }
      return rejectWithValue(error);
    }
  }
);
export const fetchHistoryOrder = createAsyncThunk(
  "createOrders/fetchHistoryOrder",
  async (
    {
      pageIndex,
      pageSize,
      searchKeyword,
      startFilterDate,
      endFilterDate,
      StatusFilter,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/Order/customer/get-pagination`,
        {
          pageIndex,
          pageSize,
          searchKeyword,
          startFilterDate,
          endFilterDate,
        },
        {
          params: { orderItemStatusFilter: StatusFilter }, // Truyền vào query parameter
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
export const fetchHistoryOrderStoreTrainer = createAsyncThunk(
  "createOrders/fetchHistoryOrderStoreTrainer",
  async (
    {
      pageIndex,
      pageSize,
      searchKeyword,
      startFilterDate,
      endFilterDate,
      StatusFilter,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/api/Order/store-trainer/get-pagination`,
        {
          pageIndex,
          pageSize,
          searchKeyword,
          startFilterDate,
          endFilterDate,
        },
        {
          params: { orderItemStatusFilter: StatusFilter }, // Truyền vào query parameter
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
export const changePackingStatus = createAsyncThunk(
  "createOrders/changePackingStatus",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/Order/order-status/packing/${orderId}`
      );
      message.success(response.data.message);
      return response.data;
    } catch (error) {
      message.error(error);
      return rejectWithValue(error);
    }
  }
);
export const changeDeliveringStatus = createAsyncThunk(
  "createOrders/changeDeliveringStatus",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/Order/order-status/delivering/${orderId}`
      );
      message.success(response.data.message);
      return response.data;
    } catch (error) {
      message.error(error);
      return rejectWithValue(error);
    }
  }
);
export const changeFeedbackStatus = createAsyncThunk(
  "createOrders/changeFeedbackStatus",
  async ({ orderId, sellerId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/Order/order-status/pending-to-feedback/${orderId}`,
        null,
        {
          params: { sellerId },
        }
      );
      message.success(response.data.message);
      return response.data;
    } catch (error) {
      message.error(error);
      return rejectWithValue(error);
    }
  }
);
export const getPrintLabel = createAsyncThunk(
  "createOrders/getPrintLabel",
  async ({ trackingId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/ghtk/print-label/${trackingId}`, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `shipping-label-${trackingId}.pdf`;
      message.success("success to received Order ");
      return { blob: response.data, filename };
    } catch (error) {
      message.warning("Failed to update status:", error);
      return rejectWithValue(error.toString());
    }
  }
);
export const getTrackingGhtk = createAsyncThunk(
  "createOrders/getTrackingGhtk",
  async ({ trackingId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/ghtk/${trackingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

// history order

const initialState = {
  dataCheckOrder: null,
  dataTrackingGhtk: "",
  order: [],
  loading: false,
  error: null,
  allfee: 0,
  pageIndex: 1,
  pageSize: 100,
  historyOrders: {
    totalCount: 0,
    dataHistoryOrder: [],
  },
  historyOrdersStoreTrainer: {
    totalCount: 0,
    dataHistoryOrder: [],
  },
};
const orderSlice = createSlice({
  name: "createOrders",
  initialState,
  reducers: {
    setPageIndex: (state, action) => {
      state.pageIndex = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },

    setsearchKeyword: (state, action) => {
      state.searchKeyword = action.payload;
    },
    setStartFilterDate: (state, action) => {
      state.startFilterDate = action.payload;
    },
    setEndFilterDate: (state, action) => {
      state.endFilterDate = action.payload;
    },

    setIsOpenDropdown: (state, action) => {
      state.isOpenDropdown = action.payload;
    },
  },
  extraReducers: (builder) => {
    handleAsyncState(builder, createOrder, (state, action) => {
      state.order = action.payload;
    });
    handleAsyncState(builder, checkSuccessOrder, (state, action) => {
      state.dataCheckOrder = action.payload;
    });
    handleAsyncState(builder, getTrackingGhtk, (state, action) => {
      state.dataTrackingGhtk = action.payload.data;
    });
    handleAsyncState(builder, getfeeShip, (state, action) => {
      if (action.payload.length > 0) {
        state.fee = action.payload[0].fee;
      }
    });

    handleAsyncState(builder, fetchHistoryOrder, (state, action) => {
      state.historyOrders.totalCount = action.payload.data.totalCount;
      state.historyOrders.dataHistoryOrder = action.payload.data.data;
    });

    handleAsyncState(
      builder,
      fetchHistoryOrderStoreTrainer,
      (state, action) => {
        state.historyOrdersStoreTrainer.totalCount =
          action.payload.data.totalCount;
        state.historyOrdersStoreTrainer.dataHistoryOrder =
          action.payload.data.data;
      }
    );
  },
});
export const {
  setPageIndex,
  setPageSize,
  setsearchKeyword,
  setEndFilterDate,
  setStartFilterDate,

  setIsOpenDropdown,
} = orderSlice.actions;
export default orderSlice.reducer;
