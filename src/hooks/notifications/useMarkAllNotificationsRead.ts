import { useMutationMarkAllNotificationsRead, type MarkAllNotificationsReadResponse } from "@/api/notifications/notifications-queries";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useMarkAllNotificationsRead = (
  options?: Omit<UseMutationOptions<MarkAllNotificationsReadResponse, Error, void>, "mutationFn">
) => {
  const mutation = useMutationMarkAllNotificationsRead(options);

  return mutation;
};
