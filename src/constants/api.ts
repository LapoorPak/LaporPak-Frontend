export const Api = {
  reports: "/reports",
  myReports: "/reports/me",
  reportsDashboard: "/reports/dashboard",
  reportLocations: "/reports/locations",
  agencyLocations: "/agencies/locations",

  notifications: "/notifications",
  notificationUnreadCount: "/notifications/unread-count",
  notificationRead: (id: string) => `/notifications/${id}/read`,
  notificationReadAll: "/notifications/read-all",
} as const;
