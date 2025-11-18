"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserData } from "@/lib/actions/userService";

export function useGetUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserData(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}
