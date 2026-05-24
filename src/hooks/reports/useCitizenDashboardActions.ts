import type { Dispatch, SetStateAction } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/api/queryKeys";
import {
  useMutationRateReport,
  useMutationSubmitReportClarification,
  useMutationVoteReport,
  type ReportLocation,
  type ReportVoteValue,
} from "@/api/reports";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { revokeObjectUrls } from "@/lib/object-url";
import { useCreateReport } from "@/hooks/reports/useCreateReport";
import {
  getOptimisticVotePatch,
  patchReportQueryData,
  type VoteMutationContext,
  type VotePatch,
} from "@/pages/dashboard/utils/reportVote";

export type CitizenInteractionMode = "idle" | "pin_drop";

type SearchLocationState = {
  name: string;
  coords: [number, number];
} | null;

interface UseCitizenDashboardActionsInput {
  title: string;
  description: string;
  photoFiles: File[];
  markerLocation: [number, number] | null;
  selectedLocation: [number, number];
  searchedLocation: SearchLocationState;
  selectedMobileReport: ReportLocation | null;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  setMode: Dispatch<SetStateAction<CitizenInteractionMode>>;
  setTitle: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setPhotoPreviews: Dispatch<SetStateAction<string[]>>;
  setPhotoFiles: Dispatch<SetStateAction<File[]>>;
  setMarkerLocation: Dispatch<SetStateAction<[number, number] | null>>;
  setSelectedMobileReport: Dispatch<SetStateAction<ReportLocation | null>>;
  onClarificationDraftActiveChange: (reportId: string, active: boolean) => void;
}

export function useCitizenDashboardActions({
  title,
  description,
  photoFiles,
  markerLocation,
  selectedLocation,
  searchedLocation,
  selectedMobileReport,
  setIsFormOpen,
  setMode,
  setTitle,
  setDescription,
  setPhotoPreviews,
  setPhotoFiles,
  setMarkerLocation,
  setSelectedMobileReport,
  onClarificationDraftActiveChange,
}: UseCitizenDashboardActionsInput) {
  const queryClient = useQueryClient();

  const refreshDashboardData = async () => {
    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.MY_REPORTS],
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.REPORTS_LOCATIONS],
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT],
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
        type: "active",
      }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] }),
    ]);
  };

  const createReport = useCreateReport({
    onSuccess: async (res) => {
      setIsFormOpen(false);
      setMode("idle");
      setTitle("");
      setDescription("");
      setPhotoPreviews((current) => {
        revokeObjectUrls(current);
        return [];
      });
      setPhotoFiles([]);
      setMarkerLocation(null);
      await refreshDashboardData();

      const aiReview = res.data?.aiReview;
      if (res.data?.status === "rejected" || aiReview?.statusAi === "ditolak") {
        toast.error("Laporan Ditolak AI", {
          description:
            aiReview?.alasanAi || "Laporan ambigu atau tidak relevan.",
          duration: 5000,
        });
      } else {
        toast.success("Laporan Berhasil Dibuat!", {
          description: "Laporan Anda telah masuk dan sedang diproses.",
        });
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to create report", error);
      toast.error("Gagal", {
        description: getApiErrorMessage(error, "Gagal membuat laporan terbaru."),
      });
    },
  });

  const submitClarification = useMutationSubmitReportClarification({
    onSuccess: async (response) => {
      onClarificationDraftActiveChange(response.data.id, false);
      setSelectedMobileReport((currentReport) =>
        currentReport?.id === response.data.id
          ? { ...currentReport, ...response.data }
          : currentReport,
      );
      await refreshDashboardData();
      toast.success("Klarifikasi terkirim", {
        description: "Balasan Anda sudah masuk ke riwayat laporan.",
      });
    },
    onError: (error: unknown) => {
      toast.error("Gagal mengirim klarifikasi", {
        description: getApiErrorMessage(
          error,
          "Coba kirim ulang beberapa saat lagi.",
        ),
      });
    },
  });

  const voteReport = useMutationVoteReport({
    onMutate: async ({ id, payload }): Promise<VoteMutationContext> => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [QUERY_KEYS.MY_REPORTS] }),
        queryClient.cancelQueries({ queryKey: [QUERY_KEYS.REPORTS_LOCATIONS] }),
      ]);

      const previousMyReportsQueries = queryClient.getQueriesData({
        queryKey: [QUERY_KEYS.MY_REPORTS],
      }) as Array<[QueryKey, unknown]>;
      const previousReportLocationQueries = queryClient.getQueriesData({
        queryKey: [QUERY_KEYS.REPORTS_LOCATIONS],
      }) as Array<[QueryKey, unknown]>;
      const previousSelectedMobileReport = selectedMobileReport;
      let sharedOptimisticPatch: VotePatch | null = null;
      const getSharedPatch = (report: ReportLocation) => {
        sharedOptimisticPatch ??= getOptimisticVotePatch(
          report,
          payload.vote,
        );
        return sharedOptimisticPatch;
      };

      queryClient.setQueriesData(
        { queryKey: [QUERY_KEYS.MY_REPORTS] },
        (data) => patchReportQueryData(data, id, getSharedPatch),
      );
      queryClient.setQueriesData(
        { queryKey: [QUERY_KEYS.REPORTS_LOCATIONS] },
        (data) => patchReportQueryData(data, id, getSharedPatch),
      );
      setSelectedMobileReport((currentReport) => {
        if (currentReport?.id !== id) return currentReport;
        return {
          ...currentReport,
          ...(sharedOptimisticPatch ??
            getOptimisticVotePatch(currentReport, payload.vote)),
        };
      });

      return {
        reportId: id,
        previousMyReportsQueries,
        previousReportLocationQueries,
        previousSelectedMobileReport,
      };
    },
    onSuccess: (response) => {
      const serverPatch = response.data;
      const getServerPatch = () => serverPatch;

      queryClient.setQueriesData(
        { queryKey: [QUERY_KEYS.MY_REPORTS] },
        (data) => patchReportQueryData(data, serverPatch.id, getServerPatch),
      );
      queryClient.setQueriesData(
        { queryKey: [QUERY_KEYS.REPORTS_LOCATIONS] },
        (data) => patchReportQueryData(data, serverPatch.id, getServerPatch),
      );
      setSelectedMobileReport((currentReport) =>
        currentReport?.id === response.data.id
          ? { ...currentReport, ...response.data }
          : currentReport,
      );
    },
    onError: (error: unknown, _variables, context) => {
      const rollback = context as VoteMutationContext | undefined;
      rollback?.previousMyReportsQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      rollback?.previousReportLocationQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (rollback) {
        setSelectedMobileReport((currentReport) =>
          currentReport?.id === rollback.reportId
            ? rollback.previousSelectedMobileReport
            : currentReport,
        );
      }
      toast.error("Gagal menyimpan vote", {
        description: getApiErrorMessage(
          error,
          "Coba vote ulang beberapa saat lagi.",
        ),
      });
    },
  });

  const rateReport = useMutationRateReport({
    onSuccess: async () => {
      await refreshDashboardData();
      toast.success("Rating tersimpan", {
        description:
          "Terima kasih, penilaian Anda membantu kualitas layanan dinas.",
      });
    },
    onError: (error: unknown) => {
      toast.error("Gagal menyimpan rating", {
        description: getApiErrorMessage(
          error,
          "Coba kirim ulang beberapa saat lagi.",
        ),
      });
    },
  });

  const handleSubmitReport = () => {
    if (!title.trim() || !description.trim() || !markerLocation) return;

    createReport.mutate({
      title,
      description,
      latitude: selectedLocation[1],
      longitude: selectedLocation[0],
      address: searchedLocation?.name,
      images: photoFiles,
    });
  };

  const handleSubmitClarification = async (
    reportId: string,
    note: string,
    images: File[],
  ) => {
    await submitClarification.mutateAsync({
      id: reportId,
      payload: { note, images },
    });
  };

  const handleVoteReport = (report: ReportLocation, vote: ReportVoteValue) => {
    voteReport.mutate({
      id: report.id,
      payload: { vote },
    });
  };

  const handleRateReport = async (
    reportId: string,
    score: number,
    note: string,
  ) => {
    await rateReport.mutateAsync({
      id: reportId,
      payload: { score, note },
    });
  };

  return {
    createReport,
    submitClarification,
    voteReport,
    rateReport,
    refreshDashboardData,
    handleSubmitReport,
    handleSubmitClarification,
    handleVoteReport,
    handleRateReport,
  };
}
