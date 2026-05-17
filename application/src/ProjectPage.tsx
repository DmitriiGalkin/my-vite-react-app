import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MeetCard from './MeetCard';
import { createVisit, deleteVisit, fetchProject } from './requests.ts';

function ProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const createVisitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: deleteVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  useEffect(() => {
    document.title = project?.title || 'Проект';
  }, [project?.title]);

  if (!id) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Не указан id проекта.</Alert>
      </Container>
    );
  }

  if (isProjectLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress size={24} />
          <Typography>Загрузка проекта...</Typography>
        </Stack>
      </Container>
    );
  }

  if (isProjectError || !project) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Не удалось загрузить проект.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}
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
            to={`/project/${id}/edit`}
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
            image={project.image || 'https://thumbs.dreamstime.com/z/none-165853060.jpg'}
            alt={project.title || 'Проект'}
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
                  sx={{
                    fontSize: {
                      xs: '2rem',
                      sm: '3rem',
                    },
                    fontWeight: 900,
                  }}
                >
                  {project.title}
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
                  {project.description}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <AvatarGroup max={5}>
                  {(project?.participations || []).map(participant => (
                    <Avatar src={participant.image} alt="Участник" key={participant.id} />
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
                  <Typography sx={{ fontWeight: 800 }}>{project?.place?.title}</Typography>
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
                  <Typography sx={{ fontWeight: 800 }}>{project?.passport?.title}</Typography>
                </Paper>
              </Box>

              <Divider />

              <Box component="section">
                <Typography component="h2" variant="h4" sx={{ mb: 2.5, fontWeight: 900 }}>
                  Расписание
                </Typography>
                <Stack spacing={2}>
                  {(project?.meets || [])
                    .filter(meeting => !meeting.deletedAt)
                    .map(meeting => (
                      <MeetCard
                        meeting={meeting}
                        key={meeting.id}
                        isVisitActionPending={
                          createVisitMutation.isPending || deleteVisitMutation.isPending
                        }
                        onCreateVisit={meetId => createVisitMutation.mutate(meetId)}
                        onDeleteVisit={visitId => deleteVisitMutation.mutate(visitId)}
                      />
                    ))}
                </Stack>{' '}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default ProjectPage;
