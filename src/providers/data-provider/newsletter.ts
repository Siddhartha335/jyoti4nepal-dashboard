import type { AxiosInstance } from "axios";

// ✅ Normalize API response
function normalizeResponse(data: any) {
  return data.newsletters ?? data.data ?? data;
}

// ✅ Newsletter-specific data provider methods
export const createNewsletterDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/newsletter`, {
        params: {
          _start: pagination?.current
            ? (pagination.current - 1) * (pagination.pageSize || 10)
            : 0,
          _end: pagination?.current
            ? pagination.current * (pagination.pageSize || 10)
            : 10,
          _sort: sorters?.[0]?.field || "createdAt",
          _order: sorters?.[0]?.order || "desc",
          ...filters?.reduce((acc: Record<string, any>, filter: any) => {
            if ("field" in filter && "value" in filter) {
              acc[filter.field] = filter.value;
            }
            return acc;
          }, {}),
        },
      });

      return {
        data: data.newsletters ?? data.data ?? data,
        total: data.total ?? data.newsletters?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/newsletter/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching newsletter ${id}:`, error);
      throw error;
    }
  },

  async create({ variables }: any) {
    try {
      const { data } = await axiosInstance.post(`/api/v1/newsletter`, variables);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error creating newsletter subscription:", error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/newsletter/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting newsletter subscription ${id}:`, error);
      throw error;
    }
  },
});