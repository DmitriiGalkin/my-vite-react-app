import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProjectForm, { type ProjectFormValues } from './ProjectForm';
import { createProject } from './requests';
import { useMutation } from '@tanstack/react-query';

function CreateProjectPage() {
  const navigate = useNavigate();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onMutate: () => {
      setSubmitError(null);
    },
    onSuccess: createdProjectId => {
      navigate(`/project/${createdProjectId}`);
    },
    onError: error => {
      console.log(error, 'error');
      setSubmitError('Не удалось создать проект. Попробуйте ещё раз.');
    },
  });

  function handleSubmit(values: ProjectFormValues) {
    createProjectMutation.mutate(values);
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
          isSubmitting={createProjectMutation.isPending}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  );
}

export default CreateProjectPage;
