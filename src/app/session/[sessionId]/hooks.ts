'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getLearningSessionById, deleteLearningSession } from "@/lib/actions/sessionActions";

export function useGetSession(sessionId: string) {
    const { data: session } = useSession();
    const userId = session?.user?.id || "";

    return useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => getLearningSessionById(sessionId, userId),
        enabled: !!sessionId && !!userId,
    });
}

export function useDeleteSession() {
    const { data: session } = useSession();
    const userId = session?.user?.id || "";
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => deleteLearningSession(sessionId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            router.push('/home');
        },
    });
}
