import { useMutationMarkNotificationRead, type MarkNotificationReadResponse } from "@/api/notifications/notifications-queries";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useMarkNotificationRead = (
  options?: Omit<UseMutationOptions<MarkNotificationReadResponse, Error, string>, "mutationFn">
) => {
  const mutation = useMutationMarkNotificationRead(options);

  return mutation;
};
