export const Api = {
  authSessionDetail: "/auth/session-detail",
  reports: "/reports",
  reportStatus: (id: string) => `/reports/${id}/status`,
  reportResolve: (id: string) => `/reports/${id}/resolve`,
  myReports: "/reports/me",
  reportsDashboard: "/reports/dashboard",
  reportLocations: "/reports/locations",
  agencyLocations: "/agencies/locations",

  notifications: "/notifications",
  notificationUnreadCount: "/notifications/unread-count",
  notificationRead: (id: string) => `/notifications/${id}/read`,
  notificationReadAll: "/notifications/read-all",
} as const;
