import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import type { Project } from './types';

type ProjectCardProps = {
  project: Project;
};

function ProjectCard({ project }: ProjectCardProps) {
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
      }}
      onClick={() => project.id && (window.location.href = `/project/${project.id}`)}
    >
      <CardMedia
        component="img"
        height="90"
        image={('https://storage.yandexcloud.net/quantum-education/'+ project.image) || `/bg.jpeg`}
        alt={project.title || 'Проект'}
        sx={{ objectFit: 'cover' }}
      />

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
