import {
  queryOptions,
} from "@tanstack/react-query";
import {
  exampleEnumArray
} from "server/constants";
import { apiClient } from "./api-client";

type ErrorMessage = {
  code: string;
  message: string;
  timeISO: string;
  stack: string;
};

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ErrorMessage;
  }
}

export const userInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["getUserInfo"],
    queryFn: async () => {
      const data = await apiClient.user.info.$get().then((r) => r.json());
      return data;
    },
    enabled: window.localStorage.getItem("token") !== null,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    throwOnError: false,
    retry: false,
  });

export const postsListQueryOptions = (page = 1, pageSize = 10, category?: typeof exampleEnumArray[number]) =>
  queryOptions({
    queryKey: ["getPostsList", page, pageSize, category],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
      };
      if (category) {
        params.category = category;
      }
      const data = await apiClient.post.list.$get({ query: params }).then((r) => r.json());
      return data;
    },
  });

export const postDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["getPostDetail", id],
    queryFn: async () => {
      const data = await apiClient.post.detail.$get({ query: { id } }).then((r) => r.json());
      return data;
    },
  });

export async function createPost({
  title,
  content,
  category,
  tags,
  isPublic,
}: {
  title: string;
  content: string;
  category?: typeof exampleEnumArray[number];
  tags?: string[];
  isPublic?: boolean;
}) {
  const res = await apiClient.post.create
    .$post({
      json: {
        title,
        content,
        category,
        tags,
        isPublic,
      },
    })
    .then((r) => r.json());
  if (res.id) {
    return res;
  }
  throw new Error(res.message);
}

export async function updatePost({
  id,
  title,
  content,
  category,
  tags,
  isPublic,
}: {
  id: string;
  title?: string;
  content?: string;
  category?: typeof exampleEnumArray[number];
  tags?: string[];
  isPublic?: boolean;
}) {
  const res = await apiClient.post.update
    .$put({
      query: { id },
      json: {
        title,
        content,
        category,
        tags,
        isPublic,
      },
    })
    .then((r) => r.json());
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
}

export async function deletePost({
  id,
}: {
  id: string;
}) {
  const res = await apiClient.post.delete
    .$delete({
      query: { id },
    })
    .then((r) => r.json());
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
}

export async function createUser({
  name,
  nickname,
  email,
  password,
  avatar,
  role,
  identity,
}: {
  name: string;
  nickname: string;
  email: string;
  password: string;
  avatar?: string;
  role?: "customer" | "agent" | "technician";
  identity?: string;
}) {
  const res = await apiClient.user.create
    .$post({
      json: {
        name,
        nickname,
        email,
        password,
        avatar,
        role,
        identity,
      },
    })
    .then((r) => r.json());
  if (res.id) {
    return res;
  }
  throw new Error(res.message);
}

export async function updateUser({
  name,
  nickname,
  email,
  avatar,
  role,
  identity,
}: {
  name?: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  role?: "customer" | "agent" | "technician";
  identity?: string;
}) {
  const res = await apiClient.user.update
    .$put({
      json: {
        name,
        nickname,
        email,
        avatar,
        role,
        identity,
      },
    })
    .then((r) => r.json());
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
}

export async function deleteUser() {
  const res = await apiClient.user.delete
    .$delete()
    .then((r) => r.json());
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
}


/**
 * How to use:
 *
 * const { data, isLoading, isError } = useQuery(userInfoQueryOptions());
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 *
 * return <div>{data.name}</div>;
 */


