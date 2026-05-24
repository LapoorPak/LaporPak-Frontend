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
