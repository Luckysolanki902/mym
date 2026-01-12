import React from 'react';
import Head from 'next/head';
import { DEFAULT_OG_IMAGE, SITE_URL, toAbsoluteUrl } from '@/utils/seo';

const DEFAULT_TITLE = 'Spyll - Your Campus Confidential | Random Chats and Anonymous Confessions';
const DEFAULT_DESCRIPTION =
    "Spyll is your ultimate destination for anonymous chats and heartfelt confessions. Connect with college students nationwide, share stories, and explore new friendships—all while maintaining your privacy. Join us now for an unforgettable online experience!";
const DEFAULT_KEYWORDS = [
    'spyll',
    'spyll app',
    'random chat',
    'anonymous',
    'random',
    'chat',
    'omegle',
    'omegle.com',
    'confessions',
    'college confessions',
    'hbtu',
    'hbtu confessions',
    'anonymous confessions',
    'chat with classmates',
    'student community',
    'secret sharing',
    'anonymous messaging',
    'college secrets',
    'spyll',
];

const DEFAULT_STRUCTURED_DATA = [
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Spyll',
        url: SITE_URL,
        logo: `${SITE_URL}/images/spyll_logos/spyll_main.png`,
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: '+91-9027495997',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['en', 'hi'],
            },
            {
                '@type': 'ContactPoint',
                telephone: '+91-6395809873',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['en', 'hi'],
            },
        ],
    },
    {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Spyll',
        description:
            'Discover a new way to connect with fellow students at Spyll. Share secrets, chat anonymously, and forge meaningful connections with your college community.',
        publisher: {
            '@type': 'Organization',
            name: 'Spyll',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/images/spyll_logos/spyll_main.png`,
            },
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
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
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="keywords" content={keywordContent} />
            <meta name="robots" content={robots} />
            <link rel="canonical" href={resolvedCanonical} />
            <link rel="icon" href={`${SITE_URL}/images/spyll_logos/spyll_main.png`} />

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
            <meta property="og:keywords" content={keywordContent} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={resolvedSeoImage} />
            <meta name="twitter:site" content="@spyll" />

            <meta name="google-site-verification" content="n1IATAh14MmCQacvLLboLaSlNHgEU2VJ9fR23FYP-sQ" />

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
