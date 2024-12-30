import { useSpring, animated } from 'react-spring';
import Head from 'next/head';
import { getSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';
import { useRouter } from 'next/router';
import TrendingConfessions from '@/components/commonComps/TrendingConfessions';
import Typewriter from 'typewriter-effect';
import { Skeleton } from '@mui/material';
// import CollegeCards from '@/components/justhomepage/CollegeCards';
import Footer from '@/components/commonComps/Footer';
import CollegeCards from '@/components/justhomepage/CollegeCards';
import InstagramCard from '@/components/justhomepage/InstagramCard';
import Link from 'next/link';
import { useMediaQuery } from '@mui/material';



export default function Home({ session, trendingConfessions, totalConfessions }) {
  const containerSpring = useSpring({
    from: { opacity: 0, transform: 'translate3d(0, -50px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  });
 const isSmallDevice = useMediaQuery('(max-width:600px)');
  const router = useRouter()


  const chatFeatures = [
    "Just friends is what we believe, rest you decide.",
    "RIP Ohmegle, say hi to Mym! Enjoy random chats and laughs with fellow students.",
    "Customize your chat filters. Talk with students from your college or connect with people from everywhere. Choose to chat with a guy or a girl.",
    "Start with a hi and see where the conversation takes you."
  ];

  const confessionFeatures = [
    "Let your secrets fly free! Anonymously share your thoughts, dreams, and confessions with your college community.",
    "Like, comment, and share confessions without revealing your identity.",
    "Send direct replies to confessions, without showing it in public comments.",
    "Get more likes and comments to make your confession trend."
  ];

  return (
    <>
      <animated.div style={containerSpring} className={styles.mainContainer}>
        {session ? (
          <>
            {/* Content to be shown only for session users */}
            {/* <button onClick={signOut}>log out</button> */}
          </>
        ) : (
          <>
            {/* Content to be shown only for non-session users */}
          </>
        )}

        {/* Content to show to both */}
        {/* <div className={styles.hiuser}>
          <Image src={'/images/large_pngs/hiuser.png'} width={1080 / 3} height={720 / 3} alt='hi user' />
        </div> */}

        {/* Trending Confessions */}
        <div style={{ width: "100%", height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <TrendingConfessions trendingConfessions={trendingConfessions} totalConfessions={totalConfessions} />
        </div>

        {/* Buttons for chat page and confession page */}
        <div className={styles.homepageBtns}>
          <button className={styles.chatbtn} onClick={() => router.push('/textchat')}>CHAT</button>
          <button className={styles.confessbtn} onClick={() => router.push('/create-confession')}>CONFESS</button>
        </div>


        <p className={styles.desc}>“Because No One Should Walk Out of College Alone”</p>


        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={'/images/showcase/makingfriends.png'} priority width={1516 / 2} height={511 / 2} alt='notohmegle' className={styles.notohmegle}></Image>
        </div>

        {/* <h3 className={styles.unlock}>AN ANOYNYMOUS INTERCOLLEGE SOCIAL MEDIA  PLATFORM</h3> */}

        <div onClick={() => router.push('/textchat')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Image src={'/images/showcase/confessionfeaturesl.png'} width={1716} height={966} alt='chatfeatures' className={styles.featuresBg}></Image>
          <div className={styles.chatfeatures}>
            {/* Chat features */}
            <div>

              <Typewriter
                options={{
                  strings: chatFeatures,
                  autoStart: true,
                  loop: true,
                  delay: 40,
                  deleteSpeed: 10
                }}
              />
            </div>

          </div>
        </div>

        <div onClick={() => router.push('/all-confessions')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Image src={'/images/showcase/chatfeaturesl.png'} width={1716} height={966} alt='chatfeatures' className={styles.featuresBg}></Image>
          <div className={styles.confessionfeatures}>
            <div>

              <Typewriter
                options={{
                  strings: confessionFeatures,
                  autoStart: true,
                  loop: true,
                  delay: 40,
                  deleteSpeed: 10
                }}
              />
            </div>

          </div>
        </div>


        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90%', margin: 'auto', marginTop: '3rem', marginBottom: '3rem' }} >
        {!isSmallDevice ?
          <Image src={'/images/illustrations/roadmapforphone.png'} className={styles.featuresBg} width={5032 / 3} height={3144 / 3} alt='roadmap'></Image>
          :
          <Image src={'/images/illustrations/roadmap-low-width.png'} className={styles.featuresBg} width={5032 / 3} height={3144 / 3} alt='roadmap'></Image>}

        </div>

        <Link href={'https://www.instagram.com/meetyourmate_/'} target="_blank" rel="noopener noreferrer" style={{ width: '100%', marginTop: '1rem', marginBottom: '2rem' }}>
          <Image src={'/images/showcase/follow2.png'} className={styles.featuresBg} width={5120 / 4} height={470 / 4} alt='instagram_link'></Image>
        </Link>

        {/* <InstagramCard /> */}

        <div className={styles.ourgoal}>
          Our <span>Goal</span>
        </div>
        <p className={styles.ourgoalP}>23IITs , 31NITs , and every other bachelor colleges on our platform</p>
        <div className={styles.comingsoonCards}>
          {/* <Image src={'/images/showcase/cards.png'} width={1348} height={688} alt='cards'  ></Image> */}
          <CollegeCards />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={'/images/illustrations/die-single.png'} width={1516} height={511} alt='notohmegle' className={styles.notohmegle}></Image>
        </div>
        {/* <CollegeCards /> */}
        {/* <div style={{ width: '100%', height: '10em' }}></div> */}
        <footer>
          <Footer />
        </footer>
      </animated.div >
    </>
  );
}

export async function getServerSideProps(context) {
  // Fetch session and user details
  const session = await getSession(context);
  const pageurl = process.env.NEXT_PUBLIC_PAGEURL;
  const res = await fetch(pageurl + '/api/confession/gettrendingconfessions');
  const data = await res.json();
  // If session is null, return null as session
  if (!session) {
    return {
      props: {
        session: null,
        trendingConfessions: data.trendingConfessions,
        totalConfessions: data.totalConfessions, 
      },
    };
  }

  if (session && !data.trendingConfessions) {
    return {
      props: {
        session: null,
        trendingConfessions: [],
        totalConfessions: 50,
      },
    }
  }

  return {
    props: {
      session,
      trendingConfessions: data.trendingConfessions,
      totalConfessions: data.totalConfessions,
    },
  };
}
