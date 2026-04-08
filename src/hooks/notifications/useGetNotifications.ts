import {
  useQueryGetNotifications,
  type GetNotificationsRequest,
  type GetNotificationsResponse,
} from "@/api/notifications/notifications-queries";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetNotifications = (
  params: GetNotificationsRequest = {},
  options?: Omit<
    UseQueryOptions<
      GetNotificationsResponse,
      Error,
      GetNotificationsResponse,
      [string, GetNotificationsRequest | undefined]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const query = useQueryGetNotifications(params, options);

  return query;
};
