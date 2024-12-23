import { Typography, Box, Container, styled } from '@mui/material';
import Image from 'next/image';

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
  width:'100%',
  height:"auto"
});

export default function ComingSoon() {
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
        <Image width={1000} height={1000} alt='mym' style={{width:'250px', height:'auto', marginBottom:'-3rem'}} src={'/images/mym_logos/mymlogo.png'}/>
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
              fontStyle:'italic'
            }}
          >
            "Because no one should walk out of college alone."
          </Typography>

        </Box>
      </Container>
    </>
  );
}

