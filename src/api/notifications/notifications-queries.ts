import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "../queryKeys";

export type NotificationType = "success" | "warning" | "danger" | "info";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  tag: string;
  laporanId: string | null;
}

export interface NotificationMeta {
  page: number;
  limit: number;
  take: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationTypeStat {
  type: NotificationType;
  total: number;
}

export interface NotificationStats {
  total: number;
  unreadCount: number;
  byType: NotificationTypeStat[];
}

export interface GetNotificationsResponse {
  data: NotificationItem[];
  meta: NotificationMeta;
  stats: NotificationStats;
}

export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  take?: number;
  unread?: boolean;
}

export interface GetUnreadNotificationsCountResponse {
  data: {
    unreadCount: number;
  };
}

export interface MarkNotificationReadResponse {
  success: boolean;
}

export interface MarkAllNotificationsReadResponse {
  success: boolean;
  count: number;
}

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
