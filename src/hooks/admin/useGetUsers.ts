import { useQueryGetUsers, type GetUsersParams } from "@/api/admin/admin-queries";
import type { ListResponse, User } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetUsers = (
  params?: GetUsersParams,
  options?: Omit<UseQueryOptions<ListResponse<User>, Error, ListResponse<User>, [string, GetUsersParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetUsers(params, options);
};
