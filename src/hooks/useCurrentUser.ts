"use client";

import { useQuery } from "@tanstack/react-query";

type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  image: string | null;
};

type ProfileResponse = {
  success: boolean;
  data?: CurrentUser;
  error?: string;
};

export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to load current user");
      }

      const body = (await response.json()) as ProfileResponse;

      if (!body.success || !body.data) {
        throw new Error(body.error ?? "Failed to load current user");
      }

      return body.data;
    },
    staleTime: 60_000,
  });
}
