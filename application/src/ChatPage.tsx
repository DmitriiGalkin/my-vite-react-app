import { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchMessages, sendMessage, type ChatMessage } from './requests';
import ChatWelcome from './ChatWelcome';
import ChatMessageList from './ChatMessageList';
import type { SpeechRecognition } from './chatUtils';
import ChatComposer from './ChatComposer';
import { useQuery } from '@tanstack/react-query';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function ChatPage() {
  const [searchParams] = useSearchParams();
  const target = searchParams.get('target');

  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState<number | null>(null);
  const [sendMessages, setSendMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);



  const { data: serverMessages = [], isLoading: isMessagesLoading } = useQuery({
    // Уникальный ключ запроса. Если chatId null, запрос не выполнится.
    queryKey: ['chat', chatId],
    queryFn: () => fetchMessages(chatId!), // Вызываем функцию API
    enabled: !!chatId, // Запрос активен только если chatId существует (аналог if (!chatId) return)
    // staleTime: 1000 * 60 * 5, // Необязательно: данные считаются "свежими" 5 минут (не будет рефетча)
  });

  const messages = [...serverMessages, ...sendMessages];

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
      setSendMessages(currentMessages => [...currentMessages, ...response.messages]);

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
      const savedChatId = localStorage.getItem('active_chat_id');
      if (savedChatId) setChatId(Number(savedChatId))
  }, []); // Пустой массив зависимостей - выполнится один раз при монтировании


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
          {target === 'idea' && <ChatWelcome />}

          {isMessagesLoading && (
            <Typography color="text.secondary" sx={{ alignSelf: 'center' }}>
              Загружаем историю...
            </Typography>
          )}

          <ChatMessageList
            chatId={chatId as number}
            messages={messages}
            isSending={isSending}
            onCreateProjectIdea={() => {
              sendChatMessage('Создать идею проекта');
            }}
          />
        </Stack>
      </Container>
      <Box ref={messagesEndRef} />
      <ChatComposer
        message={message}
        isListening={isListening}
        isSending={isSending}
        onMessageChange={setMessage}
        onMicrophoneClick={handleMicrophoneClick}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
}

export default ChatPage;
