import { Box, Button, Typography } from '@mui/material';
import ProjectCard from './ProjectCard';
import Message from './Message';
import type { ChatMessage } from './requests';
import { getProjectFromMetadata } from './chatUtils';

type ChatMessageListProps = {
  messages: ChatMessage[];
  isSending: boolean;
  onCreateProjectIdea: () => void;
};

function ChatMessageList({ messages, isSending, onCreateProjectIdea }: ChatMessageListProps) {
  return (
    <>
      {messages.map((chatMessage, index) => {
        const project = getProjectFromMetadata(chatMessage.metadata);
        const isLastMessage = index === messages.length - 1;

        return (
          <Box
            key={chatMessage.id}
            sx={{
              alignSelf: chatMessage.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Message role={chatMessage.role}>
              <Typography>{chatMessage.content}</Typography>
            </Message>

            {project && (
              <Box sx={{ mt: 2 }}>
                <ProjectCard project={project} />

                {isLastMessage && !project.id && (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={isSending}
                    sx={{ mt: 1.5 }}
                    onClick={onCreateProjectIdea}
                  >
                    {isSending ? 'Отправляем...' : 'Создать идею проекта'}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
}

export default ChatMessageList;
