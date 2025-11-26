'use client'

import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/lib/actions/sessionActions";

export function useGetSession(sessionId: string) {
    return useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => getSessionById(sessionId),
        enabled: !!sessionId,
    });
}
