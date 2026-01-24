import React from 'react';
import Head from 'next/head';
import { DEFAULT_OG_IMAGE, SITE_URL, toAbsoluteUrl } from '@/utils/seo';

const DEFAULT_TITLE = 'Spyll - India\'s Anonymous College Network | Chat, Voice Call & Confessions';
const DEFAULT_DESCRIPTION =
    "Join India's largest anonymous college network. Chat anonymously with verified students from IITs, NITs, BITS & 1300+ colleges. Voice calls, confessions & connections - 100% anonymous, end-to-end encrypted. No names, no pressure.";
const DEFAULT_KEYWORDS = [
    // Brand keywords
    'spyll',
    'spyll app',
    'spyll india',
    'spyll college',
    // Primary keywords - high search volume
    'anonymous chat',
    'anonymous chat india',
    'random chat india',
    'college chat',
    'talk to strangers india',
    'anonymous voice call',
    // College-specific keywords
    'iit confessions',
    'nit confessions',
    'bits confessions',
    'college confessions india',
    'anonymous college chat',
    'student chat app',
    'college dating app india',
    // Feature keywords
    'anonymous messaging app',
    'end-to-end encrypted chat',
    'verified student chat',
    'anonymous confession app',
    'random video chat alternative',
    // Competitor alternative keywords
    'omegle alternative india',
    'omegle india',
    'chatroulette alternative',
    'anonymous chat like omegle',
    // Long-tail keywords
    'chat with college students anonymously',
    'anonymous chat for indian students',
    'college confession wall',
    'talk to iit students',
    'meet college students online india',
    'safe anonymous chat',
    'encrypted anonymous messaging',
    // Regional/Hindi keywords
    'anonymous chat app india',
    'college students chat',
];

const DEFAULT_STRUCTURED_DATA = [
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Spyll',
        alternateName: 'Spyll India',
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/app-icons/og-image.png`,
            width: 1200,
            height: 630,
        },
        sameAs: [
            'https://instagram.com/_spyll_',
            'https://twitter.com/spyll_in',
        ],
        contactPoint: [
            {
                '@type': 'ContactPoint',
                email: 'contact@spyll.in',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['en', 'hi'],
            },
        ],
        description: 'India\'s largest anonymous college network connecting verified students from IITs, NITs, BITS and 1300+ colleges.',
    },
    {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Spyll',
        description: 'India\'s anonymous college network. Chat anonymously, voice call, and share confessions with verified students across India.',
        publisher: {
            '@type': 'Organization',
            name: 'Spyll',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/app-icons/og-image.png`,
            },
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/all-confessions?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-IN',
    },
    {
        '@context': 'https://schema.org',
        '@type': 'MobileApplication',
        '@id': `${SITE_URL}/#app`,
        name: 'Spyll - Anonymous College Network',
        operatingSystem: 'ANDROID, IOS, WEB',
        applicationCategory: 'SocialNetworkingApplication',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '500',
            bestRating: '5',
            worstRating: '1',
        },
        featureList: 'Anonymous Chat, Voice Calls, College Confessions, End-to-End Encryption, College Verification',
        description: 'Connect with verified college students anonymously. Chat, voice call, and share confessions.',
        screenshot: `${SITE_URL}/images/showcase/app-screenshot.png`,
    },
];

const normalizeKeywords = (keywordsProp) => {
    if (Array.isArray(keywordsProp)) {
        return keywordsProp.filter(Boolean);
    }
    if (typeof keywordsProp === 'string') {
        return keywordsProp
            .split(',')
            .map((word) => word.trim())
            .filter(Boolean);
    }
    return DEFAULT_KEYWORDS;
};

const normalizeStructuredData = (entries) => {
    if (!entries) return [];
    if (Array.isArray(entries)) {
        return entries.filter(Boolean);
    }
    return [entries];
};

const CustomHead = ({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    seoImage = DEFAULT_OG_IMAGE,
    canonicalUrl,
    structuredData,
    robots = 'index,follow',
    ogType = 'website',
}) => {
    const keywordList = normalizeKeywords(keywords);
    const keywordContent = keywordList.join(', ');
    const resolvedCanonical = toAbsoluteUrl(canonicalUrl || '/');
    const resolvedSeoImage = toAbsoluteUrl(seoImage || DEFAULT_OG_IMAGE);
    const schemaPayloads = [
        ...DEFAULT_STRUCTURED_DATA,
        ...normalizeStructuredData(structuredData),
    ];

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="keywords" content={keywordContent} />
            <meta name="robots" content={robots} />
            <meta name="author" content="Spyll" />
            <meta name="theme-color" content="#FF5973" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Spyll" />
            <meta name="application-name" content="Spyll" />
            <meta name="msapplication-TileColor" content="#FF5973" />
            <meta name="format-detection" content="telephone=no" />
            
            {/* Canonical & Links */}
            <link rel="canonical" href={resolvedCanonical} />
            <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            
            {/* Preconnect to important domains */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={resolvedCanonical} />
            <meta property="og:site_name" content="Spyll" />
            <meta property="og:image" content={resolvedSeoImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={`${title} preview image`} />
            <meta property="og:locale" content="en_IN" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={resolvedSeoImage} />
            <meta name="twitter:site" content="@spyll_in" />
            <meta name="twitter:creator" content="@spyll_in" />

            {/* Google Verification */}
            <meta name="google-site-verification" content="n1IATAh14MmCQacvLLboLaSlNHgEU2VJ9fR23FYP-sQ" />

            {/* Structured Data */}
            {schemaPayloads.map((schema, index) => (
                <script
                    key={`ldjson-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </Head>
    );
};

export default CustomHead;
