'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getLearningSessions, createLearningSession, CreateSessionInput } from "@/lib/actions/sessionActions";

export function useGetSessions(userId: string) {
    return useQuery({
        queryKey: ['sessions', userId],
        queryFn: () => getLearningSessions(userId),
        enabled: !!userId,
    });
}

export function useCreateSession() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (input: CreateSessionInput) => createLearningSession(input),
        onSuccess: (data, variables) => {
            // Invalidate sessions query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['sessions', variables.userId] });

            // Navigate to the new session page
            router.push(`/session/${data.id}`);
        },
    });
}