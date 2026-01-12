import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Hero,
  CollegeStrip,
  ModeSwitcher,
} from '@/components/homepage-redesign';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/utils/seo';

// Dynamically import below-the-fold sections for faster initial load
const TrendingConfessionsSection = dynamic(
  () => import('@/components/homepage-redesign/sections/TrendingConfessions'),
  { ssr: true }
);
const HowItWorks = dynamic(
  () => import('@/components/homepage-redesign/sections/HowItWorks'),
  { ssr: true }
);
const WhyVerify = dynamic(
  () => import('@/components/homepage-redesign/sections/WhyVerify'),
  { ssr: true }
);
const Safety = dynamic(
  () => import('@/components/homepage-redesign/sections/Safety'),
  { ssr: true }
);
const Testimonials = dynamic(
  () => import('@/components/homepage-redesign/sections/Testimonials'),
  { ssr: true }
);
const NewFooter = dynamic(
  () => import('@/components/homepage-redesign/sections/NewFooter'),
  { ssr: true }
);

export default function Home() {
  const [trendingConfessions, setTrendingConfessions] = useState([]);
  const [totalConfessions, setTotalConfessions] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trending confessions client-side (non-blocking)
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/confession/gettrendingconfessions');
        const data = await res.json();
        setTrendingConfessions(data.trendingConfessions || []);
        setTotalConfessions(data.totalConfessions || 50);
      } catch (error) {
        console.error('Error fetching trending:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

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
      
      {/* College Strip - Animated marquee */}
      <CollegeStrip />
      
      {/* Mode Switcher */}
      <ModeSwitcher />
      
      {/* Trending Confessions Carousel */}
      <TrendingConfessionsSection 
        confessions={trendingConfessions} 
        totalConfessions={totalConfessions}
        isLoading={isLoading}
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
