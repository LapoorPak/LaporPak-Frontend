import { useQueryGetUnreadNotificationsCount, type GetUnreadNotificationsCountResponse } from "@/api/notifications/notifications-queries";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetUnreadNotificationCount = (
  options?: Omit<
    UseQueryOptions<GetUnreadNotificationsCountResponse, Error, GetUnreadNotificationsCountResponse, [string]>,
    "queryKey" | "queryFn"
  >
) => {
  const query = useQueryGetUnreadNotificationsCount(options);

  return query;
};
