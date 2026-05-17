import { Box, Stack, Typography } from '@mui/material';
import Message from './Message';

function ChatWelcome() {
  return (
    <>
      <Stack spacing={2}>
        <Box
          component="img"
          src="/parent.svg"
          alt="Воплощаем идеи детских проектов"
          sx={{
            width: '100%',
            maxHeight: 220,
            objectFit: 'cover',
            borderRadius: 3,
          }}
        />

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
            Воплощаем идеи детских проектов
          </Typography>

          <Typography color="text.secondary">
            Даем возможность придумать свой собственный проект. Помогаем подбирать для ребенка
            интересные проекты, секции, кружки и мастер классы. Гении всегда делятся идеями
          </Typography>
        </Box>
      </Stack>

      <Message role="assistant">
        <Typography color="text.secondary">
          Расскажите поподробнее идею проекта вашего ребенка. В чем она заключается ?
        </Typography>
      </Message>
    </>
  );
}

export default ChatWelcome;
