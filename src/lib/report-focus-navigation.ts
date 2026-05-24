const REPORT_FOCUS_ID_PARAM = "reportId";
const REPORT_FOCUS_TRIGGER_PARAM = "focusAt";

export function buildReportFocusSearch(reportId: string, focusAt = Date.now()) {
  const params = new URLSearchParams();
  params.set(REPORT_FOCUS_ID_PARAM, reportId);
  params.set(REPORT_FOCUS_TRIGGER_PARAM, String(focusAt));

  return `?${params.toString()}`;
}

export function readReportFocusParams(searchParams: URLSearchParams) {
  return {
    reportId: searchParams.get(REPORT_FOCUS_ID_PARAM),
    focusTrigger: searchParams.get(REPORT_FOCUS_TRIGGER_PARAM),
  };
}
