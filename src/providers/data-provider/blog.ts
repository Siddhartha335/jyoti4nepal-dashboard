import type { AxiosInstance } from "axios";

// Turn the blog payload into multipart/form-data for Express + multer
export function toFormData(variables: any) {
  const form = new FormData();
  
  // Add text fields
  const textFields = ["title", "description", "content"];
  textFields.forEach(field => {
    if (variables[field] !== undefined) {
      form.append(field, variables[field] ?? "");
    }
  });
  
  // Add status with default
  form.append("status", variables.status ?? "Draft");
  
  // Handle tags array - convert to JSON string
  if (variables.tags) {
    form.append("tags", JSON.stringify(variables.tags));
  }
  
  // Handle file upload
  if (variables.cover_image instanceof File) {
    form.append("cover_image", variables.cover_image);
  }
  
  return form;
}

// Normalize API response
function normalizeResponse(data: any) {
  return data.blog ?? data.data ?? data;
}

// Blog-specific data provider methods
export const createBlogDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/blog`, {
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
        data: data.blogs ?? data.data ?? data,
        total: data.total ?? data.blogs?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/blog/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error);
      throw error;
    }
  },

  async create({ variables }: any) {
    try {
      const form = toFormData(variables);
      console.log("Sending POST to /api/v1/gallery");
      const { data } = await axiosInstance.post(`/api/v1/blog`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
      const form = toFormData(variables);
      const { data } = await axiosInstance.put(`/api/v1/blog/${id}`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error updating blog ${id}:`, error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/blog/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error);
      throw error;
    }
  },
});