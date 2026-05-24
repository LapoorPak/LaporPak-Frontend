import type { QueryKey } from "@tanstack/react-query";
import type { ReportLocation, ReportVoteValue } from "@/api/reports";

export type VotePatch = Pick<
  ReportLocation,
  "id" | "upvotes" | "downvotes" | "voteScore" | "myVote"
>;

export type VoteMutationContext = {
  reportId: string;
  previousMyReportsQueries: Array<[QueryKey, unknown]>;
  previousReportLocationQueries: Array<[QueryKey, unknown]>;
  previousSelectedMobileReport: ReportLocation | null;
};

export function getOptimisticVotePatch(
  report: ReportLocation,
  nextVote: ReportVoteValue,
): VotePatch {
  const previousVote = report.myVote ?? 0;
  let upvotes = report.upvotes ?? 0;
  let downvotes = report.downvotes ?? 0;

  if (previousVote === 1) {
    upvotes = Math.max(0, upvotes - 1);
  } else if (previousVote === -1) {
    downvotes = Math.max(0, downvotes - 1);
  }

  if (nextVote === 1) {
    upvotes += 1;
  } else if (nextVote === -1) {
    downvotes += 1;
  }

  return {
    id: report.id,
    upvotes,
    downvotes,
    voteScore: upvotes - downvotes,
    myVote: nextVote === 0 ? null : nextVote,
  };
}

function patchReportLocation(
  report: ReportLocation,
  reportId: string,
  getPatch: (report: ReportLocation) => VotePatch,
) {
  return report.id === reportId ? { ...report, ...getPatch(report) } : report;
}

export function patchReportQueryData(
  data: unknown,
  reportId: string,
  getPatch: (report: ReportLocation) => VotePatch,
): unknown {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray((data as { data?: unknown }).data)) {
    const response = data as { data: ReportLocation[] };
    return {
      ...response,
      data: response.data.map((report) =>
        patchReportLocation(report, reportId, getPatch),
      ),
    };
  }

  if (Array.isArray((data as { pages?: unknown }).pages)) {
    const infiniteData = data as { pages: unknown[] };
    return {
      ...infiniteData,
      pages: infiniteData.pages.map((page) =>
        patchReportQueryData(page, reportId, getPatch),
      ),
    };
  }

  return data;
}
