import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import type { Project } from './types';
import { AutoAwesome } from '@mui/icons-material';

type ProjectCardProps = {
  project: Project;
  generateImageHandler?: () => void;
  isGeneratingImage?: boolean;
};

function ProjectCard({ project, generateImageHandler, isGeneratingImage }: ProjectCardProps) {
  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        cursor: project.id ? 'pointer' : 'default', // Убираем курсор, если ссылки нет
      }}
      onClick={() => project.id && (window.location.href = `/project/${project.id}`)}
    >
      {/* Родительский контейнер для позиционирования иконки */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <CardMedia
          component="img"
          height="90"
          image={project.image || `/bg.jpeg`}
          alt={project.title || 'Проект'}
          sx={{ objectFit: 'cover' }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Полупрозрачный фон для читаемости
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
            boxShadow: 3,
            borderRadius: 16,
          }}
        >
          {/* Кнопка с иконкой в правом верхнем углу */}
          {isGeneratingImage && (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'primary.contrastText' }} />
              Генерирую...
            </>
          )}
          {generateImageHandler && (
            <IconButton
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              aria-label="Сгенерировать обложку"
              // Здесь будет обработчик клика на генерацию
              onClick={e => {
                e.stopPropagation();
                generateImageHandler();
              }}
            >
              <AutoAwesome fontSize="large" />
            </IconButton>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>
          {project.title}
        </Typography>
        <Typography color="text.secondary">{project.description}</Typography>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
