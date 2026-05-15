import { Link } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

function ChatPage() {
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

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 1,
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'white',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Введите сообщение..."
              variant="outlined"
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              sx={{
                whiteSpace: 'nowrap',
                bgcolor: '#111827',
                '&:hover': {
                  bgcolor: '#1f2937',
                },
              }}
            >
              Отправить
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default ChatPage;
