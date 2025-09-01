"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Chat = { id: string; title: string; created_at: string; user_id: string };
export type Message = {
  id?: string;
  chat_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function useChats() {
  return useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: async () => (await api.get("/chats")).data as Chat[],
  });
}

export function useCreateChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => (await api.post("/chats", { title })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });
}

export function useRenameChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) =>
      (await api.patch(`/chats/${id}`, { title })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });
}

export function useDeleteChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/chats/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useMessages(chatId?: string) {
  return useQuery<Message[]>({
    queryKey: ["messages", chatId],
    enabled: typeof chatId === "string" && chatId.length > 0,
    queryFn: async () =>
      (await api.get(`/chats/${chatId}/messages`)).data as Message[],
  });
}

export function useSendMessage(chatId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) =>
      (await api.post(`/chats/${chatId}/messages`, { content })).data,
    onMutate: async (content: string) => {
      const key = ["messages", chatId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Message[]>(key) ?? [];
      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        chat_id: chatId!,
        user_id: "me",
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      // append at the END (bottom), not the top
      qc.setQueryData<Message[]>(key, (old = []) => [...old, optimistic]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["messages", chatId], ctx.previous);
    },
    onSuccess: () => {
      // backend now always inserts assistant; this ensures we fetch it
      qc.invalidateQueries({ queryKey: ["messages", chatId] });
    },
  });
}
