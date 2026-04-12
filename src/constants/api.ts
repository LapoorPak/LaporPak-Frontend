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

export const AdminApi = {
  overview: "/admin/overview",
  dinas: "/admin/dinas",
  dinasById: (id: string) => `/admin/dinas/${id}`,
  cabang: "/admin/cabang",
  cabangById: (id: string) => `/admin/cabang/${id}`,
  kategori: "/admin/kategori",
  kategoriById: (id: string) => `/admin/kategori/${id}`,
  users: "/admin/users",
  userById: (id: string) => `/admin/users/${id}`,
  userResetPassword: (id: string) => `/admin/users/${id}/reset-password`,
  userAssignPetugas: (id: string) => `/admin/users/${id}/assign-petugas`,
} as const;
