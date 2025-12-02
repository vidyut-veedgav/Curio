'use client'

import { useQuery } from "@tanstack/react-query";
import { getLearningSessionById } from "@/lib/actions/sessionActions";

export function useGetSession(sessionId: string) {
    return useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => getLearningSessionById(sessionId),
        enabled: !!sessionId,
    });
}
