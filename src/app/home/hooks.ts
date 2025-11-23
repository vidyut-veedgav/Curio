'use client'

import { useQuery, useMutation } from "@tanstack/react-query";
import { getSessions } from "@/lib/actions/sessionActions";

export function useGetSessions(userId: string) {
    return useQuery({
        queryKey: ['sessions', userId],
        queryFn: () => getSessions(userId),
        enabled: !!userId,
    });
}