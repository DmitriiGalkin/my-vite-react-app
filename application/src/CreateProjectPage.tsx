import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiFetch } from './api';
import ProjectForm, { type ProjectFormValues } from './ProjectForm';

function CreateProjectPage() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(values: ProjectFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdProjectId = await apiFetch<number>('/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          image: values.image || null,
        }),
      });

      navigate(`/project/${createdProjectId}`);
    } catch (error) {
      console.log(error, 'error')
      setSubmitError('Не удалось создать проект. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack component="header" direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <IconButton type="button" onClick={() => navigate(-1)} aria-label="Назад">
            <ArrowBackIcon />
          </IconButton>

          <Typography component="h1" variant="h4" sx={{ fontWeight: 900 }}>
            Новый проект
          </Typography>
        </Stack>

        <ProjectForm
          initialValues={{
            title: '',
            description: '',
            image: '',
          }}
          submitButtonText="Создать проект"
          submittingButtonText="Создаём..."
          placeSelectPath="/project/create/place"
          isSubmitting={isSubmitting}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  );
}

export default CreateProjectPage;
