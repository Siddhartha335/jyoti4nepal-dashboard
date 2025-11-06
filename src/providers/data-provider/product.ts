import type { AxiosInstance } from "axios";

export function toFormData(variables: any) {
  const form = new FormData();

  const textFields = ["name", "description", "category", "status"];
  textFields.forEach((field) => {
    if (variables[field] !== undefined && variables[field] !== null) {
      form.append(field, String(variables[field]));
    }
  });

  // ✅ Tags array (stringify)
  if (variables.tags && Array.isArray(variables.tags)) {
    form.append("tags", JSON.stringify(variables.tags));
  }

  // ✅ File field (match backend: "image")
  if (variables.image instanceof File) {
    form.append("image", variables.image);
  }

  return form;
}

function normalizeResponse(data: any) {
  return data.product ?? data.data ?? data;
}

export const createProductDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/product`, {
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
            if ("field" in filter && "value" in filter) {
              acc[filter.field] = filter.value;
            }
            return acc;
          }, {}),
        },
      });

      return {
        data: data.products ?? data.data ?? data,
        total: data.total ?? data.products?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/product/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  async create({ variables }: any) {
    try {
      const form = toFormData(variables);
      const { data } = await axiosInstance.post(`/api/v1/product`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
      const form = toFormData(variables);
      const { data } = await axiosInstance.put(`/api/v1/product/${id}`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/product/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
});
