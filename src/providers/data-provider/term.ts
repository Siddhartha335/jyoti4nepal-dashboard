import type { AxiosInstance } from "axios";

export function toTermData(variables: any) {
  return {
    title: variables.title ?? "",
    content: variables.content ?? "",
    author: variables.author ?? "",
    status: variables.status ?? "Draft",
  };
}

function normalizeResponse(data: any) {
  return data.term ?? data.data ?? data;
}

// Terms-specific data provider methods
export const createTermDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/term`, {
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
        data: data.terms ?? data.data ?? data,
        total: data.total ?? data.terms?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching Terms:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/term/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching Term ${id}:`, error);
      throw error;
    }
  },

  async create({ variables }: any) {
    try {
      const termData = toTermData(variables);
      const { data } = await axiosInstance.post(`/api/v1/term`, termData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error creating Term:", error);
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
      const termData = toTermData(variables);
      const { data } = await axiosInstance.put(`/api/v1/term/${id}`, termData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error updating Term ${id}:`, error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/term/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting Term ${id}:`, error);
      throw error;
    }
  },
});