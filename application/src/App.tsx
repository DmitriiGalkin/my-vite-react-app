import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
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
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CloseIcon from '@mui/icons-material/Close'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import FolderIcon from '@mui/icons-material/Folder'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import AddIcon from '@mui/icons-material/Add'
import ProjectPage from './ProjectPage'
import EditProjectPage from './EditProjectPage'
import PlaceSelectPage from './PlaceSelectPage'
import './App.css'
import type { Project } from './types'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './api.ts'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const ACCESS_TOKEN_STORAGE_KEY = 'access_token'

function saveAccessTokenFromUrl() {
    if (typeof window === 'undefined') {
        return null
    }

    const url = new URL(window.location.href)
    const accessToken = url.searchParams.get('access_token')

    if (!accessToken) {
        return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    }

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    url.searchParams.delete('access_token')
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)

    return accessToken
}

async function fetchProjects(): Promise<Project[]> {
    return apiFetch<Project[]>('/projects')
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
]

function HomePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [accessToken, setAccessToken] = useState<string | null>(null)

    useEffect(() => {
        setAccessToken(saveAccessTokenFromUrl())
    }, [])

    const {
        data: projects = [],
        isLoading: isProjectsLoading,
        isError: isProjectsError,
    } = useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects,
        enabled: accessToken !== null,
    })

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <AppBar
                position="sticky"
                color="inherit"
                elevation={1}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Toolbar sx={{ gap: 2 }}>

                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}
                           onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                    >
                        <Avatar
                            src="https://i.pravatar.cc/120?img=5"
                            alt="Настя Галкина"
                        />
                        <Typography variant="subtitle1" fontWeight={700}>
                            Настя Галкина
                        </Typography>
                    </Stack>

                    <IconButton color="primary" aria-label="Идеи от АИ">
                        <AutoAwesomeIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer
                open={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxWidth: '85vw',
                    },
                }}
            >
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={3}>

                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                                src="https://i.pravatar.cc/120?img=5"
                                alt="Настя Галкина"
                                sx={{ width: 56, height: 56 }}
                            />
                            <Box>
                                <Typography fontWeight={800}>Настя Галкина</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    10 лет
                                </Typography>
                            </Box>
                        </Stack>

                        <List disablePadding>
                            <ListItemButton
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
                                onClick={() => setIsMenuOpen(false)}
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
                        </List>
                    </Box>
                </Box>
            </Drawer>

            <Container maxWidth="lg" sx={{ py: 4 }}>
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
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Box>
                            <Typography id="auth-section-title" variant="h5" fontWeight={800}>
                                {accessToken ? 'Вы авторизованы' : 'Войти в аккаунт'}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                {accessToken
                                    ? 'Теперь доступны защищённые разделы'
                                    : 'Выберите удобный способ авторизации'}
                            </Typography>
                        </Box>

                        {accessToken ? (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={() => {
                                    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
                                    setAccessToken(null)
                                }}
                            >
                                Выйти
                            </Button>
                        ) : (
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                {authStrategies.map((strategy) => (
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
                        )}
                    </Stack>
                </Paper>

                <Box component="section">
                    <Typography variant="h4" fontWeight={900} sx={{ mb: 3 }}>
                        Проекты
                    </Typography>

                    {isProjectsLoading && (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={24} />
                            <Typography>Загрузка проектов...</Typography>
                        </Stack>
                    )}

                    {isProjectsError && (
                        <Alert severity="error">
                            Не удалось загрузить проекты.
                        </Alert>
                    )}

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
                            {projects.map((project) => (
                                <Card
                                    component="article"
                                    key={project.id}
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 4,
                                        border: 1,
                                        borderColor: 'divider',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={project.image || 'https://placehold.co/600x400?text=Project'}
                                        alt={project.title || 'Проект'}
                                        sx={{ objectFit: 'cover' }}
                                    />

                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" fontWeight={800} gutterBottom>
                                            {project.title}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {project.description}
                                        </Typography>
                                    </CardContent>

                                    <CardActions sx={{ px: 2, pb: 2 }}>
                                        <Button
                                            component={Link}
                                            to={`/project/${project.id}`}
                                            variant="contained"
                                            fullWidth
                                        >
                                            Подробнее
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    )
}

function NotFoundPage() {
    return (
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h2" fontWeight={900} color="error">
                404
            </Typography>
            <Typography color="text.secondary">
                Страница не найдена.
            </Typography>
        </Container>
    )
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/project/:id/edit" element={<EditProjectPage />} />
            <Route path="/project/:id/edit/place" element={<PlaceSelectPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default App