import type { AxiosInstance } from "axios";

export function toFormData(variables: any) {
  const form = new FormData();

  const textFields = ["name", "role", "status"];
  textFields.forEach((field) => {
    if (variables?.[field] !== undefined && variables?.[field] !== null) {
      form.append(field, String(variables[field]));
      console.log(`✅ Appended ${field}:`, variables[field]);
    }
  });

  if (variables?.image && variables.image instanceof File) {
    form.append("image", variables.image);
    console.log("✅ Appended image file:", variables.image.name, variables.image.type, variables.image.size);
  } else {
    console.log("❌ No valid image file found");
  }

  return form;
}

function normalizeResponse(data: any) {
  return data.team ?? data.data ?? data;
}

export const createTeamDataProvider = (axiosInstance: AxiosInstance) => ({
  async getList({ pagination, filters, sorters }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/team`, {
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
        data: data.teams ?? data.data ?? data,
        total: data.total ?? data.teams?.length ?? data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  },

  async getOne({ id }: any) {
    try {
      const { data } = await axiosInstance.get(`/api/v1/team/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching team ${id}:`, error);
      throw error;
    }
  },

async create(params: any) {
  try {
    // Refine might use 'variables' instead of 'values'
    const values = params.values || params.variables || params;
    
    console.log("Extracted values:", values);
    
    const form = toFormData(values);
    const { data } = await axiosInstance.post(`/api/v1/team`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: normalizeResponse(data) };
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
},

async update(params: any) {
  try {
    console.log("=== TEAM DATA PROVIDER UPDATE ===");
    console.log("Full params:", params);
    
    // Refine might use 'variables' instead of 'values'
    const values = params.values || params.variables || params;
    
    console.log("Extracted values:", values);
    console.log("ID:", params.id);
    
    const form = toFormData(values);
    
    // Log FormData contents
    console.log("=== FormData contents for update ===");
    Array.from(form.entries()).forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
    
    const { data } = await axiosInstance.put(`/api/v1/team/${params.id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: normalizeResponse(data) };
  } catch (error) {
    console.error(`Error updating team ${params.id}:`, error);
    throw error;
  }
},

  async deleteOne({ id }: any) {
    try {
      const { data } = await axiosInstance.delete(`/api/v1/team/${id}`);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error deleting team ${id}:`, error);
      throw error;
    }
  },
});
