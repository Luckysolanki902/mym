import { getSession } from 'next-auth/react';
import {
  Hero,
  ModeSwitcher,
  TrendingConfessionsSection,
  HowItWorks,
  WhyVerify,
  Safety,
  Testimonials,
  NewFooter
} from '@/components/homepage-redesign';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/utils/seo';

export default function Home({ session, trendingConfessions, totalConfessions }) {
  return (
    <main style={{ 
      background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
      minHeight: '100vh',
      overflowX: 'hidden',
      marginTop: 0,
      paddingTop: 0
    }}>
      {/* Hero Section */}
      <Hero />
      
      {/* Mode Switcher */}
      <ModeSwitcher />
      
      {/* Trending Confessions Carousel */}
      <TrendingConfessionsSection 
        confessions={trendingConfessions} 
        totalConfessions={totalConfessions} 
      />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Why Verify Section */}
      <WhyVerify />
      
      {/* Safety Section */}
      <Safety />
      
      {/* Social Proof / Testimonials */}
      <Testimonials />
      
      {/* Footer */}
      <NewFooter />
    </main>
  );
}

const homepageUrl = `${SITE_URL}/`;

Home.seo = {
  title: "Spyll | India's Anonymous College Network",
  description:
    'Meet verified students from 10+ campuses, jump into anonymous text or voice chats, and read real confessions backed by smart safety systems—Spyll keeps your identity private while the conversations stay real.',
  keywords: [
    'anonymous college network',
    'verified student chat',
    'india college confessions',
    'campus voice chat',
    'anonymous college forum',
    'spyll app',
    'mym platform',
  ],
  canonicalUrl: homepageUrl,
  seoImage: DEFAULT_OG_IMAGE,
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${homepageUrl}#webpage`,
      url: homepageUrl,
      name: "Spyll | India's Anonymous College Network",
      description:
        'Spyll helps Indian college students find verified peers for anonymous chats, voice calls, and confession threads with community moderation.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
      about: [
        { '@type': 'Thing', name: 'Anonymous college chat' },
        { '@type': 'Thing', name: 'Verified student community' },
        { '@type': 'Thing', name: 'Indian college confessions' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does Spyll keep college chats anonymous?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Spyll verifies every student with campus documents and then masks personal identifiers in chat, voice, and confession features while still allowing reporting and moderation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I filter who I meet on Spyll?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Yes. You can filter by college, gender, or queue priority when matching for random chat or call, ensuring the experience feels relevant to your campus life.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Spyll available outside India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Spyll currently focuses on Indian colleges so local communities stay trusted. Additional campuses are vetted before being onboarded.',
          },
        },
      ],
    },
  ],
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = process.env.NEXT_PUBLIC_PAGEURL;
  
  try {
    const res = await fetch(pageurl + '/api/confession/gettrendingconfessions');
    const data = await res.json();
    
    return {
      props: {
        session: session || null,
        trendingConfessions: data.trendingConfessions || [],
        totalConfessions: data.totalConfessions || 50,
      },
    };
  } catch (error) {
    return {
      props: {
        session: session || null,
        trendingConfessions: [],
        totalConfessions: 50,
      },
    };
  }
}
