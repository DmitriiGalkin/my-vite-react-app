import { Link } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
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
    >
      <CardMedia
        component="img"
        height="180"
        image={project.image || 'https://placehold.co/600x400?text=Project'}
        alt={project.title || 'Проект'}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>
          {project.title}
        </Typography>
        <Typography color="text.secondary">{project.description}</Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button component={Link} to={`/project/${project.id}`} variant="contained" fullWidth>
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProjectCard;
