import { Typography, Box, Container, styled } from '@mui/material';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';
import TimerBox from '../chatComps/TimerBox';

const Background = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  backgroundImage: `url('/images/bgs/couple-bg2.jpg')`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.3,
  width: '100%',
  height: 'auto',
});

export default function ComingSoon() {
  const targetDate = new Date('December 30, 2024 18:00:00');

  return (
    <>
      <Background />
      <Container
        maxWidth="false"
        disableGutters
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <SpyllWordmark
          style={{
            fontSize: '4rem',
            color: '#000000',
            marginBottom: '-3rem',
          }}
        />
        <Box
          sx={{
            textAlign: 'center',
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            zIndex: 1,
          }}
        >
          <Typography
            variant="h1"
            fontFamily={"Dancing Script"}
            color={'black'}
            sx={{
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            }}
          >
            Coming Soon...
          </Typography>
          <Typography
            variant="body1"
            fontFamily={"Jost"}
            color={'black'}
            sx={{
              fontStyle: 'italic',
            }}
          >
            "Because no one should walk out of college alone."
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <TimerBox targetDate={targetDate} />
        </Box>
      </Container>
    </>
  );
}
