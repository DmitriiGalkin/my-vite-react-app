import { type ChangeEvent, type FormEvent, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import { apiFetch } from './api';

export interface ProjectFormValues {
  title: string;
  description: string;
  image: string;
}

interface ProjectFormProps {
  initialValues: ProjectFormValues;
  submitButtonText: string;
  submittingButtonText: string;
  placeSelectPath: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  placeInfo?: ReactNode;
  extraContent?: ReactNode;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
}

function ProjectForm({
  initialValues,
  submitButtonText,
  submittingButtonText,
  placeSelectPath,
  isSubmitting = false,
  submitError = null,
  placeInfo,
  extraContent,
  onSubmit,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [image, setImage] = useState(initialValues.image);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImageUploading(true);
    setImageUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadedImageUrl = await apiFetch<string>('/image', {
        method: 'POST',
        body: formData,
      });

      setImage(uploadedImageUrl);
    } catch (error) {
      setImageUploadError('Не удалось загрузить изображение. Попробуйте ещё раз.');
    } finally {
      setIsImageUploading(false);
      event.target.value = '';
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      title,
      description,
      image,
    });
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {submitError && <Alert severity="error">{submitError}</Alert>}

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
                value={title}
                onChange={event => setTitle(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Описание"
                multiline
                rows={6}
                value={description}
                onChange={event => setDescription(event.target.value)}
                fullWidth
              />
              <Stack spacing={2}>
                {imageUploadError && <Alert severity="error">{imageUploadError}</Alert>}

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Обложка проекта
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {image ? 'Изображение загружено' : 'Загрузите изображение для карточки'}
                    </Typography>
                  </Box>

                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    disabled={isImageUploading}
                  >
                    {isImageUploading ? 'Загружаем...' : 'Выбрать файл'}
                    <Box
                      component="input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
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

                {image && (
                  <Box
                    component="img"
                    src={image}
                    alt="Обложка проекта"
                    sx={{
                      width: '100%',
                      maxHeight: 320,
                      objectFit: 'cover',
                      borderRadius: 3,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  />
                )}

                <TextField
                  label="Ссылка на изображение"
                  type="url"
                  value={image}
                  onChange={event => setImage(event.target.value)}
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
            <Stack spacing={2.5}>
              <Typography component="h2" variant="h5" sx={{ fontWeight: 900 }}>
                Место
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={Link}
                  to={placeSelectPath}
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
                {placeInfo || (
                  <Typography color="text.secondary">
                    Место пока можно будет выбрать позже. Сейчас создаём базовую карточку проекта.
                  </Typography>
                )}
              </Paper>
            </Stack>
          </CardContent>
        </Card>

        {extraContent}

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          disabled={isSubmitting || isImageUploading}
          sx={{
            alignSelf: { xs: 'stretch', sm: 'flex-end' },
            px: 4,
            py: 1.25,
            borderRadius: 3,
            fontWeight: 800,
          }}
        >
          {isSubmitting ? submittingButtonText : submitButtonText}
        </Button>
      </Stack>
    </Box>
  );
}

export default ProjectForm;
