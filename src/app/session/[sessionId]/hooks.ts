'use client'

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getLearningSessionById } from "@/lib/actions/sessionActions";

export function useGetSession(sessionId: string) {
    const { data: session } = useSession();
    const userId = session?.user?.id || "";

    return useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => getLearningSessionById(sessionId, userId),
        enabled: !!sessionId && !!userId,
    });
}
