import {
  useQueryGetUserActivity,
  useQueryGetUsers,
  type GetUserActivityParams,
  type GetUsersParams,
} from "@/api/admin/admin-queries";
import type { BaseResponse, ListResponse, User, UserActivity } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetUsers = (
  params?: GetUsersParams,
  options?: Omit<UseQueryOptions<ListResponse<User>, Error, ListResponse<User>, [string, GetUsersParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetUsers(params, options);
};

export const useGetUserActivity = (
  params?: GetUserActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<UserActivity>, Error, BaseResponse<UserActivity>, [string, GetUserActivityParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetUserActivity(params, options);
};
