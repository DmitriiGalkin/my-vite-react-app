import { Box, Button, Typography } from '@mui/material';
import ProjectCard from './ProjectCard';
import Message from './Message';
import { type ChatMessage, generateImage } from './requests';
import { getProjectFromMetadata } from './chatUtils';
import ReactMarkdown from 'markdown-to-jsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';


type ChatMessageListProps = {
  chatId: number;
  messages: ChatMessage[];
  isSending: boolean;
  onCreateProjectIdea: () => void;
};

function ChatMessageList({
  chatId,
  messages,
  isSending,
  onCreateProjectIdea,
}: ChatMessageListProps) {
  const queryClient = useQueryClient();

  const generateImageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: a => {
      console.log(a, 'a');
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    },
  });

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
              <Typography>
                <ReactMarkdown>{chatMessage.content}</ReactMarkdown>
              </Typography>
            </Message>

            {project && (
              <Box sx={{ mt: 2, alignItems: 'center' }}>
                <ProjectCard
                  project={project}
                  isGeneratingImage={generateImageMutation.isPending}
                  generateImageHandler={() => generateImageMutation.mutate(chatMessage.id)}
                />

                {isLastMessage && !project.id && (
                  <Button
                    variant="contained" // Оставляем contained для оранжевого фона
                    fullWidth
                    sx={{
                      mt: 1.5,

                      // --- СТИЛИ СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЯ ---
                      alignSelf: 'flex-end', // Прижимаем к правому краю (как у пользователя)
                      borderRadius: 16, // Скругление для "пузыря" справа
                      bgcolor: '#FFB628', // Оранжевый цвет пользователя
                      color: 'white', // Белый текст

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
