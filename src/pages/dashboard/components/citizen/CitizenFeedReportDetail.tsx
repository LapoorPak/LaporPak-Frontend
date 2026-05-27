import { ArrowLeft, MapPin } from "lucide-react";
import type { CitizenFeedReportDetailProps } from "@/types/dashboard";
import { ReportPopup } from "@/pages/dashboard/components/citizen/ReportPopup";

export function CitizenFeedReportDetail({
  report,
  onBack,
  onNavigateMap,
  onFocusAgency,
  onPhotoClick,
  onVote,
  isVoting,
  onSubmitClarification,
  clarificationSubmittingId,
  onClarificationDraftActiveChange,
  onSubmitRating,
  ratingSubmittingId,
}: CitizenFeedReportDetailProps) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-[#f3f4f6] px-3 pb-28 pt-52 sm:px-5 sm:pb-36 sm:pt-24 md:px-8 md:pt-28">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center gap-2 rounded-full px-2.5 text-xs font-black text-gray-700"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
            Kembali
          </button>

          <button
            type="button"
            onClick={onNavigateMap}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-gray-900 px-3 text-xs font-black text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            <MapPin size={14} strokeWidth={2.5} />
            Lihat di Map
          </button>
        </div>

        <div className="overflow-hidden rounded-sm border border-gray-100 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <ReportPopup
            report={report}
            onPhotoClick={onPhotoClick}
            onVote={onVote}
            onFocusAgency={onFocusAgency}
            isVoting={isVoting}
            onSubmitClarification={onSubmitClarification}
            clarificationSubmittingId={clarificationSubmittingId}
            onClarificationDraftActiveChange={onClarificationDraftActiveChange}
            onSubmitRating={onSubmitRating}
            ratingSubmittingId={ratingSubmittingId}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
