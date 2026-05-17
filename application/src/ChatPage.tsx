import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import ProjectCard from './ProjectCard';
import Message from './Message';
import type { Project } from './types';
import { fetchMessages, sendMessage, type ChatMessage } from './requests';

function getProjectFromMetadata(metadata: unknown): Project | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata) as Project;
    } catch {
      return null;
    }
  }

  return metadata as Project;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState<number | null>(() => {
    const savedChatId = localStorage.getItem('active_chat_id');

    return savedChatId ? Number(savedChatId) : null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  async function sendChatMessage(text: string) {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const response = await sendMessage({
        chatId,
        message: trimmedMessage,
      });

      setChatId(response.chatId);
      localStorage.setItem('active_chat_id', String(response.chatId));
      setMessages(currentMessages => [...currentMessages, ...response.messages]);

      if (trimmedMessage === message.trim()) {
        setMessage('');
      }
    } catch (error) {
      console.log(error, 'error');
      alert('Не удалось отправить сообщение. Попробуйте ещё раз.');
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      setIsMessagesLoading(true);

      try {
        const loadedMessages = await fetchMessages(chatId);

        if (isMounted) {
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.log(error, 'error');
      } finally {
        if (isMounted) {
          setIsMessagesLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [chatId]);

  const handleMicrophoneClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      alert('Распознавание речи не поддерживается в этом браузере.');
      return;
    }

    const recognition = new SpeechRecognitionApi();

    recognition.lang = 'ru-RU';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = event => {
      const transcript = Array.from(
        { length: event.results.length },
        (_, index) => event.results[index][0].transcript,
      ).join(' ');

      setMessage(transcript);
      console.log(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleSendMessage = async () => {
    await sendChatMessage(message);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundImage: 'linear-gradient(to bottom, #FFB628, #FF8F28)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton component={Link} to="/" aria-label="Назад" sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', color: 'white' }}>
            <Avatar sx={{ bgcolor: '#111827', color: 'white' }}>AI</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Чат</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Идеи и рекомендации
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{
          py: 3,
          pb: 8,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Stack spacing={2}>
            <Box
              component="img"
              src="/parent.svg"
              alt="Воплощаем идеи детских проектов"
              sx={{
                width: '100%',
                maxHeight: 220,
                objectFit: 'cover',
                borderRadius: 3,
              }}
            />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                Воплощаем идеи детских проектов
              </Typography>

              <Typography color="text.secondary">
                Даем возможность придумать свой собственный проект. Помогаем подбирать для ребенка
                интересные проекты, секции, кружки и мастер классы. Гении всегда делятся идеями
              </Typography>
            </Box>
          </Stack>

          <Message role="assistant">
            <Typography color="text.secondary">
              Расскажите поподробнее идею проекта вашего ребенка. В чем она заключается ?
            </Typography>
          </Message>

          {isMessagesLoading && (
            <Typography color="text.secondary" sx={{ alignSelf: 'center' }}>
              Загружаем историю...
            </Typography>
          )}

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

                        {isLastMessage && (
                          <Button
                            variant="contained"
                            fullWidth
                            disabled={isSending}
                            sx={{ mt: 1.5 }}
                            onClick={() => {
                              sendChatMessage('Создать идею проекта');
                            }}
                          >
                            {isSending ? 'Отправляем...' : 'Создать идею проекта'}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
              <Box ref={messagesEndRef} />
        </Stack>
      </Container>

      <Box
        component="footer"
        sx={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1200,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          px: 2,
          py: 1,
          pb: 'calc(8px + env(safe-area-inset-bottom))',
        }}
      >
        <Container maxWidth="md" disableGutters>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Введите сообщение..."
              variant="outlined"
              value={message}
              onChange={event => setMessage(event.target.value)}
            />
            <IconButton
              aria-label={isListening ? 'Остановить запись' : 'Говорить'}
              onClick={handleMicrophoneClick}
              sx={{
                color: isListening ? '#FF8F28' : '#111827',
                border: 1,
                borderColor: isListening ? '#FF8F28' : 'divider',
              }}
            >
              <MicIcon />
            </IconButton>
            <IconButton
              aria-label="Отправить"
              disabled={!message.trim() || isSending}
              onClick={handleSendMessage}
              sx={{
                color: isSending ? '#FF8F28' : '#111827',
                border: 1,
                borderColor: isSending ? '#FF8F28' : 'divider',
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default ChatPage;
