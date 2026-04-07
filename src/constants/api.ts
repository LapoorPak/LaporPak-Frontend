export const Api = {
  reports: "/reports",
  reportDetail: (id: string) => `/reports/${id}`,
  reportStatus: (id: string) => `/reports/${id}/status`,
  reportAssign: (id: string) => `/reports/${id}/assign`,
  myReports: "/reports/me",
  myReportsLocations: "/reports/me/locations",
  nearbyReports: "/reports/nearby",
  reportLocations: "/reports/locations",

  agencies: "/agencies",
  agencyDetail: (id: string) => `/agencies/${id}`,
  agencyStats: (id: string) => `/agencies/${id}/stats`,
  agencyReports: (id: string) => `/agencies/${id}/reports`,
  agencyLocations: "/agencies/locations",

  categories: "/categories",

  uploadImage: "/upload/image",
} as const;
