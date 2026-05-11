import { Link, useNavigate } from 'react-router-dom'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SaveIcon from '@mui/icons-material/Save'

const subscribers = [
    {
        id: 1,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=5',
    },
    {
        id: 2,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=6',
    },
    {
        id: 3,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=7',
    },
    {
        id: 4,
        name: 'Настя',
        age: '8 лет',
        image: 'https://i.pravatar.cc/80?img=8',
    },
]

function EditProjectPage() {
    const navigate = useNavigate()

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
                <Stack
                    component="header"
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <IconButton type="button" onClick={() => navigate(-1)} aria-label="Назад">
                        <ArrowBackIcon />
                    </IconButton>

                    <Typography component="h1" variant="h4" fontWeight={900}>
                        EditProject
                    </Typography>
                </Stack>

                <Box component="form">
                    <Stack spacing={3}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Название проекта"
                                        type="text"
                                        defaultValue="Женские встречи с заботой..."
                                        fullWidth
                                    />

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <TextField
                                            label="Возраст от"
                                            type="number"
                                            defaultValue={3}
                                            fullWidth
                                        />

                                        <TextField
                                            label="Возраст до"
                                            type="number"
                                            defaultValue={3}
                                            fullWidth
                                        />
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                                <TextField
                                    label="Описание"
                                    multiline
                                    rows={6}
                                    defaultValue="Встречаемся, мажемся кремиками, массируем себя скребками, плавно потягиваемся и напитываемся нежностью."
                                    fullWidth
                                />
                            </CardContent>
                        </Card>

                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    justifyContent="space-between"
                                    spacing={2}
                                >
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Обложка проекта
                                        </Typography>
                                        <Typography fontWeight={800}>
                                            Загрузите изображение для карточки
                                        </Typography>
                                    </Box>

                                    <Button
                                        component="label"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                    >
                                        Выбрать файл
                                        <Box
                                            component="input"
                                            type="file"
                                            accept="image/*"
                                            sx={{
                                                clip: 'rect(0 0 0 0)',
                                                clipPath: 'inset(50%)',
                                                height: 1,
                                                overflow: 'hidden',
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                whiteSpace: 'nowrap',
                                                width: 1,
                                            }}
                                        />
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                                <Stack spacing={2.5}>
                                    <Typography component="h2" variant="h5" fontWeight={900}>
                                        Место
                                    </Typography>

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                        <Button
                                            component={Link}
                                            to="/project/1/edit/place"
                                            variant="contained"
                                            startIcon={<LocationOnIcon />}
                                        >
                                            Выбрать на карте
                                        </Button>

                                        <Button type="button" variant="outlined">
                                            Перекресток
                                        </Button>
                                    </Stack>

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            bgcolor: 'grey.100',
                                        }}
                                    >
                                        <Typography sx={{ mb: 1.5 }}>
                                            Стоимость аренды зала 1000 рублей в час. У них три зала и только в одном
                                            можно провести балет. Могут предоставить столы и стулья. Могут предоставить
                                            узкий гос интернет.
                                        </Typography>

                                        <Typography>
                                            Окончательное подтверждение времени необходимо производить по телефону:
                                            <Typography component="strong" fontWeight={900}>
                                                {' '}
                                                89265463465
                                            </Typography>
                                            .
                                        </Typography>
                                    </Paper>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                                <Stack spacing={2.5}>
                                    <Typography component="h2" variant="h5" fontWeight={900}>
                                        Подписчики
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: 'repeat(2, minmax(0, 1fr))',
                                                sm: 'repeat(4, minmax(0, 1fr))',
                                            },
                                            gap: 2,
                                        }}
                                    >
                                        {subscribers.map((subscriber) => (
                                            <Paper
                                                component="article"
                                                elevation={0}
                                                key={subscriber.id}
                                                sx={{
                                                    p: 2,
                                                    textAlign: 'center',
                                                    borderRadius: 3,
                                                    bgcolor: 'grey.100',
                                                }}
                                            >
                                                <Avatar
                                                    src={subscriber.image}
                                                    alt={subscriber.name}
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        mx: 'auto',
                                                        mb: 1,
                                                    }}
                                                />

                                                <Typography fontWeight={800}>
                                                    {subscriber.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {subscriber.age}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            sx={{
                                alignSelf: { xs: 'stretch', sm: 'flex-end' },
                                px: 4,
                                py: 1.25,
                                borderRadius: 3,
                                fontWeight: 800,
                            }}
                        >
                            Сохранить изменения
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    )
}

export default EditProjectPage