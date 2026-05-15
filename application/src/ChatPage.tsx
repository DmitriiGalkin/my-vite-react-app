import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { apiFetch } from './api';

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
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);

    try {
      await apiFetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      setMessage('');
    } catch (error) {
      console.log(error, 'error');
      alert('Не удалось отправить сообщение. Попробуйте ещё раз.');
    } finally {
      setIsSending(false);
    }
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
          pb: 12,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              alignSelf: 'flex-start',
              maxWidth: '80%',
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'white',
              overflow: 'hidden',
            }}
          >
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
                  интересные проекты, секции, кружки и мастер классы.
                </Typography>
              </Box>
            </Stack>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              alignSelf: 'flex-start',
              maxWidth: '80%',
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'white',
              overflow: 'hidden',
            }}
          >
            <Typography color="text.secondary">
              Расскажите поподробнее идею проекта вашего ребенка. В чем она заключается ?
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              alignSelf: 'flex-end',
              maxWidth: '80%',
              borderRadius: 4,
              bgcolor: '#FFB628',
              color: '#111827',
            }}
          >
            <Typography>Хочу придумать новый проект.</Typography>
          </Paper>
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
