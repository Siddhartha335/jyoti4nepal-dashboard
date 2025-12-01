import type { AxiosInstance } from "axios";

export function toPopupFormData(variables: any) {
  const form = new FormData();

  // ✅ Add text fields
  const textFields = ["title", "type", "content", "buttonText", "buttonLink", "status"];
  textFields.forEach((field) => {
    if (variables[field] !== undefined && variables[field] !== null) {
      form.append(field, String(variables[field]));
    }
  });

  // ✅ Handle date fields
  if (variables.startDate) {
    form.append("startDate", String(variables.startDate));
  }
  if (variables.endDate) {
    form.append("endDate", String(variables.endDate));
  }

  // ✅ Handle media file upload (image or video)
  if (variables.media instanceof File) {
    form.append("image", variables.media); // Backend expects "image" field name
  }

  return form;
}

function normalizePopupResponse(data: any) {
  return data.popup ?? data.data ?? data;
}

export const createPopupDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/popup`, {
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
        data: data.popups ?? data.data ?? data,
        total: data.total ?? data.popups?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching popups:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/popup/${id}`);
      return { data: normalizePopupResponse(data) };
    } catch (error) {
      console.error(`Error fetching popup ${id}:`, error);
      throw error;
    }
  },

  async create({ variables }: any) {
    try {
      const form = toPopupFormData(variables);
      const { data } = await axiosInstance.post(`/api/v1/popup`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { data: normalizePopupResponse(data) };
    } catch (error) {
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
      const form = toPopupFormData(variables);
      const { data } = await axiosInstance.put(`/api/v1/popup/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { data: normalizePopupResponse(data) };
    } catch (error) {
      console.error(`Error updating popup ${id}:`, error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/popup/${id}`);
      return { data: normalizePopupResponse(data) };
    } catch (error) {
      console.error(`Error deleting popup ${id}:`, error);
      throw error;
    }
  },
});