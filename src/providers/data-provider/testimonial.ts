import type { AxiosInstance } from "axios";

export function toTestimonialFormData(variables: any) {
  const form = new FormData();
  
  // Handle image upload (required)
  if (variables.company_logo instanceof File) {
    form.append("company_logo", variables.company_logo);
  }
  
  // Add required text fields
  if (variables.name !== undefined) {
    form.append("name", variables.name ?? "");
  }
  
  if (variables.email !== undefined) {
    form.append("email", variables.email ?? "");
  }
  
  if (variables.content !== undefined) {
    form.append("content", variables.content ?? "");
  }
  
  // Add rating (convert to string for form data)
  if (variables.rating !== undefined) {
    form.append("rating", String(variables.rating ?? 5));
  }
  
  // Add featured enum - must be "Featured" or "Normal"
  if (variables.featured !== undefined) {
    form.append("featured", variables.featured ?? "Normal");
  }
  
  // Add status enum - must be "Published" or "Draft"
  if (variables.status !== undefined) {
    form.append("status", variables.status ?? "Draft");
  }
  
  return form;
}

// Normalize API response
function normalizeResponse(data: any) {
  return data.data ?? data.testimonial ?? data;
}

// Testimonial-specific data provider methods
export const createTestimonialDataProvider = (axiosInstance: AxiosInstance) => ({
  async create({ variables }: any) {
    try {
      const form = toTestimonialFormData(variables);
      const { data } = await axiosInstance.post(`/api/v1/testimonial`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error creating testimonial:", error);
      throw error;
    }
  },

  async getList({ pagination, filters, sorters }: any) {
    try {
      const filterParams = (filters || []).reduce((acc: Record<string, any>, f: any) => {
        if (f?.field && f?.value !== undefined) {
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
        ...filterParams,
      };

      const { data } = await axiosInstance.get(`/api/v1/testimonial`, { params });

      return {
        data: data.testimonials ?? data.data ?? data,
        total: data.total ?? (data.testimonials?.length ?? 0),
      };
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/testimonial/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching testimonial ${id}:`, error);
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
      const form = toTestimonialFormData(variables);
      const { data } = await axiosInstance.put(`/api/v1/testimonial/${id}`, form);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error updating testimonial ${id}:`, error);
      throw error;
    }
  },

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/testimonial/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting testimonial ${id}:`, error);
      throw error;
    }
  },
}); 