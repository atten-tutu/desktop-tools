import { initClient } from "server/rpc";
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

export const apiClient = initClient(import.meta.env.BASE_URL, {
  fetch: myFetch,
});
