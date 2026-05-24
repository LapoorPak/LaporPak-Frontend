import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "@/api/queryKeys";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetUnreadNotificationsCountResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
} from "@/types/notifications";

export type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetUnreadNotificationsCountResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  NotificationItem,
  NotificationMeta,
  NotificationStats,
  NotificationType,
  NotificationTypeStat,
} from "@/types/notifications";

export function useQueryGetNotifications<TData = GetNotificationsResponse, TError = Error>(
  params?: GetNotificationsRequest,
  options?: Omit<
    UseQueryOptions<GetNotificationsResponse, TError, TData, [string, GetNotificationsRequest | undefined]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, params],
    queryFn: async () => {
      const response = await apiClient.get<GetNotificationsResponse>(Api.notifications, {
        params,
      });

      return response.data;
    },
    ...options,
  });
}

export function useQueryGetUnreadNotificationsCount<
  TData = GetUnreadNotificationsCountResponse,
  TError = Error,
>(
  options?: Omit<
    UseQueryOptions<GetUnreadNotificationsCountResponse, TError, TData, [string]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT],
    queryFn: async () => {
      const response = await apiClient.get<GetUnreadNotificationsCountResponse>(Api.notificationUnreadCount);

      return response.data;
    },
    ...options,
  });
}

export function useMutationMarkNotificationRead(
  options?: Omit<UseMutationOptions<MarkNotificationReadResponse, Error, string>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.patch<MarkNotificationReadResponse>(Api.notificationRead(notificationId));

      return response.data;
    },
    ...options,
  });
}

export function useMutationMarkAllNotificationsRead(
  options?: Omit<UseMutationOptions<MarkAllNotificationsReadResponse, Error, void>, "mutationFn">
) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch<MarkAllNotificationsReadResponse>(Api.notificationReadAll);

      return response.data;
    },
    ...options,
  });
}
