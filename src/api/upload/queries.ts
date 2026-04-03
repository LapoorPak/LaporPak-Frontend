import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";

export const useMutationUploadImage = () =>
  useMutation<{ url: string }, Error, File>({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiClient
        .post(Api.uploadImage, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
  });
