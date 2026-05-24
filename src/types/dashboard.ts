import type {
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import type { LucideIcon } from "lucide-react";
import type { DashboardViewMode } from "@/context/dashboard-view-mode";
import type { AgencyLocation } from "@/types/agencies";
import type {
  DashboardReportItem,
  ReportLocation,
  ReportStatus,
  ReportsDashboardTab,
  ReportsDashboardTabKey,
  ReportsScope,
  ReportVoteValue,
} from "@/types/reports";
import type { SearchResult } from "@/types/search";

export type DashboardSummaryStat = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
};

export type ClarificationDraft = {
  note: string;
  files: File[];
  previews: string[];
};

export type CitizenReportFormPanelProps = {
  isOpen: boolean;
  isDesktop: boolean;
  title: string;
  description: string;
  photoPreviews: string[];
  selectedLocation: [number, number];
  userLocation: [number, number] | null;
  isSubmitting: boolean;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onPhotoClick: (images: string[], index: number) => void;
  onEditLocation: () => void;
  onUseGpsLocation: () => void;
  onSubmit: () => void;
};

export type CitizenMyReportsPanelProps = {
  isOpen: boolean;
  isDesktop: boolean;
  myReports: ReportLocation[];
  myReportsSearch: string;
  statusMap: Record<string, { label: string; color: string }>;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onFocusReport: (report: ReportLocation) => void;
  onPhotoClick: (images: string[], index: number) => void;
  onSubmitClarification: (
    reportId: string,
    note: string,
    images: File[],
  ) => Promise<void> | void;
  onClarificationDraftActiveChange?: (
    reportId: string,
    active: boolean,
  ) => void;
  clarificationSubmittingId?: string | null;
  onSubmitRating: (
    reportId: string,
    score: number,
    note: string,
  ) => Promise<void> | void;
  ratingSubmittingId?: string | null;
};

export type ReportPopupProps = {
  report: ReportLocation;
  onPhotoClick: (images: string[], index: number) => void;
  onVote?: (report: ReportLocation, vote: ReportVoteValue) => void;
  isVoting?: boolean;
  fullWidth?: boolean;
  onSubmitClarification?: (
    reportId: string,
    note: string,
    images: File[],
  ) => Promise<void> | void;
  clarificationSubmittingId?: string | null;
  onClarificationDraftActiveChange?: (
    reportId: string,
    active: boolean,
  ) => void;
};

export type CitizenFeedReportCardProps = {
  report: ReportLocation;
  onPhotoClick: (images: string[], index: number) => void;
  onVote: (report: ReportLocation, vote: ReportVoteValue) => void;
  onOpenReportDetail: (report: ReportLocation) => void;
  onOpenMyReports?: (report: ReportLocation) => void;
  isVoting?: boolean;
};

export type CitizenSocialFeedProps = {
  reports: ReportLocation[];
  onPhotoClick: (images: string[], index: number) => void;
  onVote: (report: ReportLocation, vote: ReportVoteValue) => void;
  onOpenReportDetail: (report: ReportLocation) => void;
  onOpenMyReports: (report: ReportLocation) => void;
  onLoadMore: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  votingReportId?: string | null;
};

export type CitizenFeedReportDetailProps = {
  report: ReportLocation;
  onBack: () => void;
  onNavigateMap: () => void;
  onPhotoClick: (images: string[], index: number) => void;
  onVote: (report: ReportLocation, vote: ReportVoteValue) => void;
  isVoting?: boolean;
  onSubmitClarification?: (
    reportId: string,
    note: string,
    images: File[],
  ) => Promise<void> | void;
  clarificationSubmittingId?: string | null;
  onClarificationDraftActiveChange?: (
    reportId: string,
    active: boolean,
  ) => void;
};

export type CitizenReportFilterStatus = Exclude<ReportStatus, "rejected">;

export type CitizenDashboardFiltersProps = {
  value: CitizenReportFilterStatus[];
  onChange: (status: CitizenReportFilterStatus | "all") => void;
  showAgencies?: boolean;
  onToggleAgencies?: () => void;
  showAgencyToggle?: boolean;
  className?: string;
};

export type AgencyPopupCarouselProps = {
  agency: AgencyLocation;
  onPhotoClick: (images: string[], index: number) => void;
};

export type LocationSearchResultsDropdownProps = {
  isOpen: boolean;
  query: string;
  isLoading: boolean;
  results: SearchResult[];
  onSelectPlace: (place: SearchResult) => void;
  className?: string;
  emptyMessage?: string;
};

export type AnimatedCountProps = {
  value: number;
  durationMs?: number;
  className?: string;
};

export type PhotoLightboxState = { images: string[]; index: number } | null;

export type PhotoLightboxProps = {
  images: string[];
  index: number;
  onClose: () => void;
};

export type DashboardViewModeOption = {
  key: DashboardViewMode;
  label: string;
  icon: LucideIcon;
};

export type DashboardViewModeToggleProps = {
  value: DashboardViewMode;
  onChange: (mode: DashboardViewMode) => void;
};

export type AgencyReportDetailDrawerProps = {
  isOpen: boolean;
  isDesktop: boolean;
  report: ReportLocation | null;
  draftStatus: string | null;
  agencyNote: string;
  resolutionNote: string;
  resolutionProofPreviews: string[];
  canEdit: boolean;
  isSaving: boolean;
  isSaveDisabled: boolean;
  onClose: () => void;
  onDraftStatusChange: (status: string) => void;
  onAgencyNoteChange: (value: string) => void;
  onResolutionNoteChange: (value: string) => void;
  onResolutionProofUpload: (files: FileList | null) => void;
  onRemoveResolutionProof: (index: number) => void;
  onSave: () => void;
  onPhotoClick?: (images: string[], index: number) => void;
};

export type AgencyFeedReportDetailProps = Omit<
  AgencyReportDetailDrawerProps,
  "isOpen" | "isDesktop" | "onClose"
> & {
  onBack: () => void;
  onNavigateMap: () => void;
};

export type AgencyReportsListPanelProps = {
  isOpen: boolean;
  activeTabs: ReportsDashboardTabKey[];
  reports: DashboardReportItem[];
  searchQuery: string;
  selectedMarkerId: string | null;
  stats: DashboardSummaryStat[];
  tabs: ReportsDashboardTab[];
  totalCount: number;
  isLoading: boolean;
  onTabChange: (tab: ReportsDashboardTabKey) => void;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
};

export type AgencySocialFeedProps = {
  reports: DashboardReportItem[];
  totalCount: number;
  isLoading: boolean;
  onSelectReport: (reportId: string) => void;
  onOpenReportDetail?: (reportId: string) => void;
  onLoadMore: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};

export type AgencyDashboardFiltersProps = {
  activeTabs: ReportsDashboardTabKey[];
  tabs: ReportsDashboardTab[];
  onTabChange: (tab: ReportsDashboardTabKey) => void;
  className?: string;
};

export type AgencyMobileNavbarControlsProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  viewMode: "map" | "feed";
  locationSearchQuery: string;
  reportSearchQuery: string;
  debouncedLocationSearchQuery: string;
  showLocationSearch: boolean;
  isSearchingLocations: boolean;
  locationSearchResults: SearchResult[];
  scope: ReportsScope;
  isDashboardOpen: boolean;
  onLocationSearchChange: (query: string) => void;
  onReportSearchChange: (query: string) => void;
  onLocationSearchFocus: (isOpen: boolean) => void;
  onSelectPlace: (place: SearchResult) => void;
  onScopeChange: (scope: ReportsScope) => void;
  onToggleDashboard: () => void;
};

export type MobileSheetResizeHandler = (
  event: ReactPointerEvent,
) => void;
