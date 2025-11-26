"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setUserData, UpdateUserDataInput } from "@/lib/actions/userActions";

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserDataInput) => setUserData(userId, data),
    onSuccess: (updatedUser) => {
      // Update the user query cache
      queryClient.setQueryData(["user", userId], updatedUser);
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}
