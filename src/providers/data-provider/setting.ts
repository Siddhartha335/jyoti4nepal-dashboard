import type { AxiosInstance } from "axios";

export function toSettingData(variables: any) {
  return {
    site_name: variables.site_name ?? "",
    site_description: variables.site_description ?? "",
    contact_email: variables.contact_email ?? "",
    facebook_link: variables.facebook_url ?? null,
    instagram_link: variables.instagram_url ?? null,
    youtube_link: variables.youtube_url ?? null,
    maintenance_mode: variables.maintenace_mode ?? false,
    enable_analytics: variables.enable_analytics ?? true,
    cookie_consent: variables.cookie_consent ?? true,
  };
}

function normalizeResponse(data: any) {
  // Map backend field names to frontend field names
  const setting = data.setting ?? data.data ?? data;
  
  if (setting) {
    return {
      ...setting,
      facebook_url: setting.facebook_link,
      instagram_url: setting.instagram_link,
      youtube_url: setting.youtube_link,
      maintenace_mode: setting.maintenance_mode,
    };
  }
  
  return setting;
}

// Settings-specific data provider methods
export const createSettingDataProvider = (axiosInstance: AxiosInstance) => ({
  async getOne({ id }: any) {
    try {
      // If ID is "current", use the /current endpoint
      const endpoint = id === "current" 
        ? `/api/v1/setting/current` 
        : `/api/v1/setting/${id}`;
      
      const { data } = await axiosInstance.get(endpoint);
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error fetching Setting:`, error);
      throw error;
    }
  },

  async create({ variables }: any) {
    try {
      const settingData = toSettingData(variables);
      const { data } = await axiosInstance.post(`/api/v1/setting`, settingData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error("Error creating Setting:", error);
      throw error;
    }
  },

  async update({ id, variables }: any) {
    try {
      const settingData = toSettingData(variables);
      const { data } = await axiosInstance.put(`/api/v1/setting/${id}`, settingData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return { data: normalizeResponse(data) };
    } catch (error) {
      console.error(`Error updating Setting ${id}:`, error);
      throw error;
    }
  },
});