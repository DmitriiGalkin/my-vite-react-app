import { Avatar, AvatarGroup, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { Meet, User } from './types';

export interface ExtendedMeet extends Meet {
  visits?: {
    id: number;
    userId: number;
    user: User;
  }[];
}

type MeetCardProps = {
  meeting: ExtendedMeet;
  isVisitActionPending: boolean;
  onCreateVisit: (meetId: number) => void;
  onDeleteVisit: (visitId: number) => void;
};

function MeetCard({ meeting, isVisitActionPending, onCreateVisit, onDeleteVisit }: MeetCardProps) {
  const startedAt = new Date(meeting.startedAt);
  const currentUserVisit = meeting.visits?.find(visit => visit.userId === 2);
  const isCurrentUserVisited = Boolean(currentUserVisit);

  return (
    <Paper
      component="article"
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1.25} sx={{ minWidth: 140, alignItems: 'center' }}>
            <EventIcon color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Дата
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {startedAt.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                })}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ minWidth: 120, alignItems: 'center' }}>
            <ScheduleIcon color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Время
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {startedAt.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ minWidth: 120, alignItems: 'center' }}>
            <PaymentsIcon color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Цена
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {meeting.price ? `${meeting.price} ₽` : 'Бесплатно'}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <AvatarGroup max={5}>
            {(meeting?.visits || []).map(visit => (
              <Avatar src={visit.user.image || undefined} alt="Участник" key={visit.user.id} />
            ))}
          </AvatarGroup>

          <Chip label="+5 участников" color="primary" variant="outlined" />
        </Stack>

        <Button
          variant="contained"
          size="large"
          disabled={isVisitActionPending}
          onClick={() => {
            if (currentUserVisit?.id) {
              onDeleteVisit(currentUserVisit.id);

              return;
            }

            onCreateVisit(meeting.id);
          }}
        >
          {isVisitActionPending ? 'Отправка...' : isCurrentUserVisited ? 'Выйти' : 'Участвовать'}
        </Button>
      </Stack>
    </Paper>
  );
}

export default MeetCard;
