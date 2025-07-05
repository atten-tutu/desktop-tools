import ky from "ky";

export const myFetch = ky.extend({
  headers: {
    Authorization: `Bearer ${window.localStorage.getItem("token")}`,
  },
  hooks: {
    afterResponse: [
      async (_, __, response: Response) => {
        if (response.ok) {
          return response;
        }
        throw await response.json();
      },
    ],
  },
  retry: 1,
  throwHttpErrors: true,
});

const API_BASE_URL = "http://47.110.158.139:3771";

export const apiClient = {
  get: async (url: string) => {
    return myFetch.get(`${API_BASE_URL}${url}`).json();
  },
  post: async (url: string, data: any) => {
    return myFetch.post(`${API_BASE_URL}${url}`, { json: data }).json();
  },
  put: async (url: string, data: any) => {
    return myFetch.put(`${API_BASE_URL}${url}`, { json: data }).json();
  },
  delete: async (url: string) => {
    return myFetch.delete(`${API_BASE_URL}${url}`).json();
  },
};
