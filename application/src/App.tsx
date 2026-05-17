import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import ProjectPage from './ProjectPage';
import CreateProjectPage from './CreateProjectPage';
import EditProjectPage from './EditProjectPage';
import PlaceSelectPage from './PlaceSelectPage';
import ChatPage from './ChatPage';
import ProjectCard from './ProjectCard';
import './App.css';
import type { Passport, Project, User } from './types';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api.ts';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

function saveAccessTokenFromUrl() {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const accessToken = url.searchParams.get('access_token');

  if (!accessToken) {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  url.searchParams.delete('access_token');
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

  return accessToken;
}

type Type = 'self' | 'ideas' | 'projects' | null;

interface ExtendedPassport extends Passport {
  users?: User[];
}

async function fetchPassport(): Promise<ExtendedPassport> {
  return apiFetch<ExtendedPassport>('/passport');
}

async function fetchProjects(type: Type, userId: number): Promise<Project[]> {
  return apiFetch<Project[]>('/projects' + '?variant=' + type + '&userId=' + userId);
}

const authStrategies = [
  {
    title: 'Google',
    href: `${API_URL}/login/google`,
    icon: 'G',
  },
  {
    title: 'Yandex',
    href: `${API_URL}/login/yandex`,
    icon: 'Я',
  },
];

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [type, setType] = useState<Type>(
    null,
  );

  const initialAccessToken = saveAccessTokenFromUrl();

  useEffect(() => {
    if (!accessToken && initialAccessToken) {
      window.requestAnimationFrame(() => {
        setAccessToken(initialAccessToken);
      });
    }
  }, [accessToken, initialAccessToken]);

  const { data: passport } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    enabled: Boolean(accessToken),
  });

  const currentUser = passport?.users?.[0];

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', type],
    queryFn: () => fetchProjects(type, 1),
    //enabled: accessToken !== null,
  });

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
          {accessToken ? (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                flexGrow: 1,
                alignItems: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
              onClick={() => setIsMenuOpen(currentValue => !currentValue)}
            >
              <Avatar
                src={currentUser?.image || undefined}
                alt={currentUser?.title || 'Пользователь'}
                sx={{ border: '2px solid white' }}
              />
              <Typography sx={{ fontWeight: 700 }} component="span" variant="subtitle1">
                {currentUser?.title || 'Пользователь'}
              </Typography>
            </Stack>
          ) : (
            <div>
              <Typography sx={{ fontWeight: 700 }} component="span" variant="subtitle1">
                Quantum
              </Typography>
            </div>
          )}

          <IconButton
            component={Link}
            to="/chat"
            color="primary"
            aria-label="Идеи от АИ"
            sx={{ color: 'white' }}
          >
            <AutoAwesomeIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {accessToken && (
        <Drawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={3}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={currentUser?.image || undefined}
                  alt={currentUser?.title || 'Пользователь'}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    {currentUser?.title || 'Пользователь'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser?.age ? `${currentUser.age} лет` : 'Возраст не указан'}
                  </Typography>
                </Box>
              </Stack>

              <List disablePadding>
                <ListItemButton
                  component={Link}
                  to="/chat?target=idea"
                  onClick={() => {
                    localStorage.removeItem('active_chat_id');
                  }}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Новая идея" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setType('self');
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LightbulbIcon />
                  </ListItemIcon>
                  <ListItemText primary="Мои проекты и идеи" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <ListItemText primary="Календарь" />
                </ListItemButton>
              </List>
            </Stack>

            <Box sx={{ mt: 'auto' }}>
              <List disablePadding>
                <ListItemButton
                  component={Link}
                  to="/project/create"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <CreateNewFolderIcon />
                  </ListItemIcon>
                  <ListItemText primary="Новый проект" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText primary="Мои проекты" />
                </ListItemButton>

                {accessToken && (
                  <ListItemButton
                    component={Link}
                    to="/"
                    onClick={() => {
                      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                      setAccessToken(null);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <KeyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Выйти" />
                  </ListItemButton>
                )}
              </List>
            </Box>
          </Box>
        </Drawer>
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!accessToken && (
          <Paper
            component="section"
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              mb: 4,
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
            }}
            aria-labelledby="auth-section-title"
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: {
                  xs: 'stretch',
                  sm: 'center',
                },
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800 }} id="auth-section-title" variant="h5">
                  Войти в аккаунт
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Выберите удобный способ авторизации
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {authStrategies.map(strategy => (
                  <Button
                    component="a"
                    variant="contained"
                    href={strategy.href}
                    key={strategy.title}
                    sx={{ minWidth: 120 }}
                  >
                    <Box component="span" sx={{ mr: 1, fontWeight: 900 }}>
                      {strategy.icon}
                    </Box>
                    {strategy.title}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Paper>
        )}
        <Box component="section">
          <Typography sx={{ fontWeight: 900, mb: 3 }} variant="h4">
            Проекты
          </Typography>

          {isProjectsLoading && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <CircularProgress size={24} />
              <Typography>Загрузка проектов...</Typography>
            </Stack>
          )}

          {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

          {!isProjectsLoading && !isProjectsError && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 3,
              }}
            >
              {projects.map(project => (
                <ProjectCard project={project} key={project.id} />
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" sx={{ fontWeight: 900 }} color="error">
        404
      </Typography>
      <Typography color="text.secondary">Страница не найдена.</Typography>
    </Container>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/project/create" element={<CreateProjectPage />} />
      <Route path="/project/:id" element={<ProjectPage />} />
      <Route path="/project/:id/edit" element={<EditProjectPage />} />
      <Route path="/project/:id/edit/place" element={<PlaceSelectPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
