import type { AxiosInstance } from "axios";

function normalizeResponse(data: any) {
  return data.contact ?? data.data ?? data;
}

export const createContactDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/contact`, {
        params: {
          _start: pagination?.current 
            ? (pagination.current - 1) * (pagination.pageSize || 10) 
            : 0,
          _end: pagination?.current 
            ? pagination.current * (pagination.pageSize || 10) 
            : 10,
          _sort: sorters?.[0]?.field,
          _order: sorters?.[0]?.order,
          ...filters?.reduce((acc: Record<string, any>, filter: any) => {
            if ('field' in filter && 'value' in filter) {
              acc[filter.field] = filter.value;
            }
            return acc;
          }, {}),
        },
      });

      return {
        data: data.contacts ?? data.data ?? data,
        total: data.total ?? data.contacts?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/contact/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching Contact ${id}:`, error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/contact/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting Contact ${id}:`, error);
      throw error;
    }
  },
});