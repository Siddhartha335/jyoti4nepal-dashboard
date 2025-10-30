import type { AxiosInstance } from "axios";

export function toGalleryFormData(variables: any) {
  const form = new FormData();
  
  // Handle image upload (required)
  if (variables.image instanceof File) {
    form.append("image_url", variables.image);
  }

  // Add optional text fields
  if (variables.album !== undefined) {
    form.append("album", variables.album ?? "Products");
  }
  
  if (variables.image_description !== undefined) {
    form.append("image_description", variables.image_description ?? "");
  }
  
  return form;
}

function normalizeResponse(data: any) {
  return data.data ?? data.image ?? data;
}

// Gallery-specific data provider methods
export const createGalleryDataProvider = (axiosInstance: AxiosInstance) => ({
  async create({ variables }: any) {
    try {
      const form = toGalleryFormData(variables);
      const { data } = await axiosInstance.post(`/api/v1/gallery`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      throw error;
    }
  },

  async getList({ pagination, filters, sorters }: any) {
    try {
      // Map Refine filters into query params (supports album + q)
      const filterParams = (filters || []).reduce((acc: Record<string, any>, f: any) => {
        if (f?.field && f?.value !== undefined) {
          // convention: use 'q' for search text filter
          acc[f.field] = f.value;
        }
        return acc;
      }, {});

      const params = {
        _start: pagination?.current
          ? (pagination.current - 1) * (pagination.pageSize || 10)
          : 0,
        _end: pagination?.current
          ? pagination.current * (pagination.pageSize || 10)
          : 10,
        _sort: sorters?.[0]?.field,
        _order: sorters?.[0]?.order,
        ...filterParams, // e.g., { album: 'Products', q: 'chair' }
      };

      const { data } = await axiosInstance.get(`/api/v1/gallery`, { params });

      return {
        data: data.images ?? data.data ?? data,
        total: data.total ?? (data.images?.length ?? 0),
      };
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/gallery/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error);
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
          const form = toGalleryFormData(variables);
          const { data } = await axiosInstance.put(`/api/v1/gallery/${id}`, form);
          return { data: normalizeResponse(data) };
        } catch (error) {
          console.error(`Error updating gallery ${id}:`, error);
          throw error;
        }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/gallery/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error);
      throw error;
    }
  },
});