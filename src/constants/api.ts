export const Api = {
  reports: "/reports",
  reportDetail: (id: string) => `/reports/${id}`,
  reportStatus: (id: string) => `/reports/${id}/status`,
  reportAssign: (id: string) => `/reports/${id}/assign`,
  myReports: "/reports/me",
  nearbyReports: "/reports/nearby",

  agencies: "/agencies",
  agencyDetail: (id: string) => `/agencies/${id}`,
  agencyStats: (id: string) => `/agencies/${id}/stats`,
  agencyReports: (id: string) => `/agencies/${id}/reports`,

  categories: "/categories",

  uploadImage: "/upload/image",
} as const;
