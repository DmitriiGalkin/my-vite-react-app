import type { Project } from './types';

export type SpeechRecognitionConstructor = new () => SpeechRecognition;

export type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export type SpeechRecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
};

export function getProjectFromMetadata(metadata: unknown): Project | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'string') {
    try {
      console.log(metadata, 'metadata metadata');

      console.log(JSON.parse(metadata), 'getProjectFromMetadata metadata');
      return JSON.parse(metadata) as Project;
    } catch {
      return null;
    }
  }

  return metadata as Project;
}
