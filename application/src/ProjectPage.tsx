import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import EventIcon from '@mui/icons-material/Event'
import PaymentsIcon from '@mui/icons-material/Payments'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { meetings } from './mocks'
import type {Project} from "./types.ts";
import {apiFetch} from "./api.ts";
import {useQuery} from "@tanstack/react-query";

async function fetchProject(): Promise<Project[]> {
  return apiFetch<Project[]>('/project')
}

function ProjectPage() {
  const navigate = useNavigate()

  const userImages = [
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/65.jpg',
    'https://randomuser.me/api/portraits/men/45.jpg',
  ]

  const {
    data: project
  } = useQuery({
    queryKey: ['project'],
    queryFn: fetchProject,
  })

  console.log(project, 'project')

  useEffect(() => {
    document.title = 'Эпоксидная смола'
  }, [])

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
          <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
          >
            <Button
                type="button"
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
            >
              Назад
            </Button>

            <Button
                component={Link}
                to="/project/1/edit"
                variant="outlined"
                startIcon={<EditIcon />}
            >
              Редактировать
            </Button>
          </Stack>

          <Card
              elevation={0}
              sx={{
                overflow: 'hidden',
                borderRadius: 4,
                border: 1,
                borderColor: 'divider',
              }}
          >
            <CardMedia
                component="img"
                height="360"
                image="https://thumbs.dreamstime.com/z/none-165853060.jpg"
                alt="Эпоксидная смола"
                sx={{
                  objectFit: 'cover',
                  height: {
                    xs: 220,
                    sm: 360,
                  },
                }}
            />

            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                      component="h1"
                      variant="h3"
                      fontWeight={900}
                      sx={{
                        fontSize: {
                          xs: '2rem',
                          sm: '3rem',
                        },
                      }}
                  >
                    Эпоксидная смола
                  </Typography>

                  <Typography
                      color="text.secondary"
                      sx={{
                        mt: 1.5,
                        fontSize: {
                          xs: '1rem',
                          sm: '1.1rem',
                        },
                        lineHeight: 1.7,
                      }}
                  >
                    Изготовление изделий из эпоксидной смолы, изучение различных техник заливки,
                    форм, цветов, текстур.
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <AvatarGroup max={5}>
                    {userImages.map((participant) => (
                        <Avatar src={participant} alt="Участник" key={participant} />
                    ))}
                  </AvatarGroup>

                  <Chip label="+5 участников" color="primary" variant="outlined" />
                </Stack>

                <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(3, minmax(0, 1fr))',
                      },
                      gap: 2,
                    }}
                >
                  <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'grey.100',
                      }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Место
                    </Typography>
                    <Typography fontWeight={800}>
                      Лесной дом
                    </Typography>
                  </Paper>

                  <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'grey.100',
                      }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Возраст
                    </Typography>
                    <Typography fontWeight={800}>
                      5-7 лет
                    </Typography>
                  </Paper>

                  <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'grey.100',
                      }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Организатор
                    </Typography>
                    <Typography fontWeight={800}>
                      Галкин Дмитрий
                    </Typography>
                  </Paper>
                </Box>

                <Divider />

                <Box component="section">
                  <Typography component="h2" variant="h4" fontWeight={900} sx={{ mb: 2.5 }}>
                    Расписание
                  </Typography>

                  <Stack spacing={2}>
                    {meetings
                        .filter((meeting) => !meeting.deletedAt)
                        .map((meeting) => {
                          const startedAt = new Date(meeting.startedAt)

                          return (
                              <Paper
                                  component="article"
                                  elevation={0}
                                  key={meeting.id}
                                  sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    border: 1,
                                    borderColor: 'divider',
                                  }}
                              >
                                <Stack
                                    direction={{ xs: 'column', md: 'row' }}
                                    alignItems={{ xs: 'stretch', md: 'center' }}
                                    justifyContent="space-between"
                                    spacing={2}
                                >
                                  <Stack
                                      direction={{ xs: 'column', sm: 'row' }}
                                      spacing={2}
                                      sx={{ flexGrow: 1 }}
                                  >
                                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 140 }}>
                                      <EventIcon color="primary" />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Дата
                                        </Typography>
                                        <Typography fontWeight={800}>
                                          {startedAt.toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                          })}
                                        </Typography>
                                      </Box>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 120 }}>
                                      <ScheduleIcon color="primary" />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Время
                                        </Typography>
                                        <Typography fontWeight={800}>
                                          {startedAt.toLocaleTimeString('ru-RU', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </Typography>
                                      </Box>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 120 }}>
                                      <PaymentsIcon color="primary" />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Цена
                                        </Typography>
                                        <Typography fontWeight={800}>
                                          {meeting.price ? `${meeting.price} ₽` : 'Бесплатно'}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Stack>

                                  <Button variant="contained" size="large">
                                    Участвовать
                                  </Button>
                                </Stack>
                              </Paper>
                          )
                        })}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
  )
}

export default ProjectPage