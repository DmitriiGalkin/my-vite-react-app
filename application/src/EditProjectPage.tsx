import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import ProjectForm, { type ProjectFormValues } from './ProjectForm';
import type { Place, Project, User } from './types';

interface ProjectDetails extends Project {
  place?: Place | null;
  participations?: User[];
}

function toFormValues(project: ProjectDetails): ProjectFormValues {
  return {
    title: project.title ?? '',
    description: project.description ?? '',
    image: project.image ?? '',
  };
}

function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const projectId = id ? Number(id) : null;

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiFetch<ProjectDetails>(`/project/${projectId}`),
    enabled: projectId !== null && !Number.isNaN(projectId),
  });

  async function handleSubmit(values: ProjectFormValues) {
    if (!projectId) {
      setSubmitError('Не удалось определить номер проекта.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiFetch(`/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          image: values.image || null,
        }),
      });

      navigate(`/project/${projectId}`);
    } catch {
      setSubmitError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!projectId || Number.isNaN(projectId)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Некорректный номер проекта.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack component="header" direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <IconButton type="button" onClick={() => navigate(-1)} aria-label="Назад">
            <ArrowBackIcon />
          </IconButton>

          <Typography component="h1" variant="h4" sx={{ fontWeight: 900 }}>
            Редактирование проекта
          </Typography>
        </Stack>

        {isLoading && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <CircularProgress size={24} />
            <Typography>Загрузка проекта...</Typography>
          </Stack>
        )}

        {isError && <Alert severity="error">Не удалось загрузить проект.</Alert>}

        {project && (
          <ProjectForm
            key={project.id}
            initialValues={toFormValues(project)}
            submitButtonText="Сохранить изменения"
            submittingButtonText="Сохраняем..."
            placeSelectPath={`/project/${project.id}/edit/place`}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            placeInfo={
              project.place ? (
                <>
                  {project.place.title && (
                    <Typography sx={{ fontWeight: 900, mb: 1 }}>{project.place.title}</Typography>
                  )}

                  {project.place.address && (
                    <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                      {project.place.address}
                    </Typography>
                  )}

                  {project.place.description && (
                    <Typography>{project.place.description}</Typography>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">Место пока не выбрано.</Typography>
              )
            }
            extraContent={
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
                    <Typography component="h2" variant="h5" sx={{ fontWeight: 900 }}>
                      Участники
                    </Typography>

                    {project.participations?.length ? (
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
                        {project.participations.map(participant => (
                          <Paper
                            component="article"
                            elevation={0}
                            key={participant.id}
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              borderRadius: 3,
                              bgcolor: 'grey.100',
                            }}
                          >
                            <Avatar
                              src={participant.image ?? undefined}
                              alt={participant.title ?? 'Участник'}
                              sx={{
                                width: 64,
                                height: 64,
                                mx: 'auto',
                                mb: 1,
                              }}
                            />

                            <Typography sx={{ fontWeight: 800 }}>
                              {participant.title ?? 'Без имени'}
                            </Typography>

                            {participant.age !== null && participant.age !== undefined && (
                              <Typography variant="body2" color="text.secondary">
                                {participant.age} лет
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">Пока нет участников.</Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            }
          />
        )}
      </Container>
    </Box>
  );
}

export default EditProjectPage;
