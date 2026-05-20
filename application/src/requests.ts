import { apiFetch } from './api';
import type { Place, Project } from './types';
import type { ExtendedMeet } from './MeetCard';
import type { ProjectFormValues } from './ProjectForm';

export interface ExtendedProject extends Project {
  passport?: {
    title: string;
  };
  place?: {
    address: string;
    title: string;
    description: string;
  };
  meets?: ExtendedMeet[];
  participations?: {
    age: null;
    title: string;
    id: string;
    image: string;
  }[];
}

export type ChatMessage = {
  id: number;
  chatId: number;
  passportId: number | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source: 'text' | 'voice';
  metadata: unknown;
  createdAt: string;
};

export type SendMessageResponse = {
  chatId: number;
  messages: ChatMessage[];
};

export async function fetchProject(id: string): Promise<ExtendedProject> {
  return apiFetch<ExtendedProject>(`/project/${id}`);
}

export async function createProject(values: ProjectFormValues): Promise<number> {
  return apiFetch<number>('/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: values.title,
      description: values.description,
      image: values.image || null,
    }),
  });
}

export async function updateProject(projectId: number, values: ProjectFormValues) {
  return apiFetch(`/project/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: values.title,
      description: values.description,
      image: values.image || null,
    }),
  });
}

export async function fetchPlaces(): Promise<Place[]> {
  return apiFetch<Place[]>('/places');
}

export async function fetchMessages(chatId: number): Promise<ChatMessage[]> {
  return apiFetch<ChatMessage[]>(`/chat/${chatId}/messages`);
}

export async function sendMessage({
  chatId,
  message,
}: {
  chatId: number | null;
  message: string;
}): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatId,
      message,
    }),
  });
}

export async function createVisit(meetId: number) {
  return apiFetch('/visit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ meetId, userId: 2 }),
  });
}

export async function deleteVisit(visitId: number) {
  return apiFetch(`/visit/${visitId}`, {
    method: 'DELETE',
  });
}

export async function generateImage(messageId: number) {
  return apiFetch(`/message/${messageId}/generateImage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: undefined,
  });
}