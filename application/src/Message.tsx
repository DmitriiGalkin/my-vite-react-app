import { Paper } from '@mui/material';
import type { ChatMessage } from './requests.ts';

type ChatBubbleProps = {
  role: ChatMessage['role'];
  children: React.ReactNode;
};

export default function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUserMessage = role === 'user';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        alignSelf: isUserMessage ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        borderRadius: isUserMessage ? '16px 16px 0 16px' : '16px 16px 16px 0',
        border: isUserMessage ? 0 : 1,
        borderColor: 'divider',
        bgcolor: isUserMessage ? '#FFB628' : 'white',
        color: isUserMessage ? '#111827' : 'text.primary',
      }}
    >
      {children}
    </Paper>
  );
}
