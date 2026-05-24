import axios from "axios";

type ApiErrorBody = {
  error?: string;
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return (
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
}
