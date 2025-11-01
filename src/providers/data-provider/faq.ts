import type { AxiosInstance } from "axios";

// Turn the FAQ payload into multipart/form-data for Express + multer
export function toFormData(variables: any) {
  const form = new FormData();
  
  // Add text fields
  const textFields = ["question", "answer"];
  textFields.forEach(field => {
    if (variables[field] !== undefined) {
      form.append(field, variables[field] ?? "");
    }
  });

  form.append("status", variables.status ?? "Draft");
  
  // Add category with default
  form.append("category", variables.category ?? "General");
  
  // Add display_order with default
  form.append("display_order", String(variables.display_order ?? 0));
  
  return form;
}

// Normalize API response
function normalizeResponse(data: any) {
  return data.faq ?? data.data ?? data;
}

// FAQ-specific data provider methods
export const createFaqDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/faq`, {
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
        data: data.faqs ?? data.data ?? data,
        total: data.total ?? data.faqs?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/faq/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching FAQ ${id}:`, error);
      throw error;
    }
  },

  async create({ variables }: any) {
    try {
      const form = toFormData(variables);
      const { data } = await axiosInstance.post(`/api/v1/faq`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error creating FAQ:", error);
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
      const form = toFormData(variables);
      const { data } = await axiosInstance.put(`/api/v1/faq/${id}`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error updating FAQ ${id}:`, error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/faq/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting FAQ ${id}:`, error);
      throw error;
    }
  },
});