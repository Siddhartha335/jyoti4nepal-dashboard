import type { AxiosInstance } from "axios";

// Normalize API response
function normalizeResponse(data: any) {
  return data.user ?? data.data ?? data;
}

// User-specific data provider methods
export const createUserDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/user`, {
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
        data: data.users ?? data.data ?? data,
        total: data.total ?? data.users?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/user/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },
});