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
                    variant="contained" // Оставляем contained для оранжевого фона
                    fullWidth
                    sx={{
                      mt: 1.5,

                      // --- СТИЛИ СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЯ ---
                      alignSelf: 'flex-end', // Прижимаем к правому краю (как у пользователя)
                      maxWidth: '80%',
                      borderRadius: '16px 16px 0 16px', // Скругление для "пузыря" справа
                      bgcolor: '#FFB628', // Оранжевый цвет пользователя
                      color: 'white', // Белый текст

                      // --- СТИЛИ ДЛЯ "БЛЕКЛОГО" ВАРИАНТА ---
                      opacity: 0.6, // Делаем кнопку полупрозрачной (блеклой)
                      boxShadow: 'none', // Убираем тень для чистоты

                      // Показываем, что на кнопку можно нажать
                      cursor: 'pointer',

                      // Эффект при наведении (делаем чуть ярче)
                      '&:hover': {
                        opacity: 0.8, // Становится чуть менее прозрачным при наведении
                        transform: 'scale(1.01)', // Легкое увеличение для интерактивности
                        transition: 'all 0.1s ease-in-out', // Плавный переход
                      },
                    }}
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
