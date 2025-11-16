import React from 'react';
import Head from 'next/head';

const DEFAULT_TITLE = 'MYM - Meet Your Mate | Random Chats and Anonymous Confessions for College Students';
const DEFAULT_DESCRIPTION =
    "Meet Your Mate (MYM) is your ultimate destination for anonymous chats and heartfelt confessions. Connect with college students nationwide, share stories, and explore new friendships—all while maintaining your privacy. Join us now for an unforgettable online experience!";
const DEFAULT_KEYWORDS = [
    'mym',
    'meetyourmate',
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
    'mym',
    'meetyourmate',
];
const DEFAULT_SEO_IMAGE = 'https://www.meetyourmate.in/images/mym_logos/mymshadow.png';

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

const CustomHead = ({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    seoImage = DEFAULT_SEO_IMAGE,
}) => {
    const keywordList = normalizeKeywords(keywords);
    const keywordContent = keywordList.join(', ');
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="https://www.meetyourmate.in/images/mym_logos/mymshadow.png" />
            <meta
                property="og:keywords"
                                content={keywordContent}
            />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={`meetyourmate.in`} />
            <meta property="og:site_name" content="MYM" />
            <meta name="twitter:title" content={title} key="tw-title" />
            <meta name="twitter:description" content={description} key="tw-desc" />
            <meta name="twitter:card" content="summary_large_image" key="tw-card" />
                        <meta name="keywords" content={keywordContent} />
            <meta property="og:image" content={seoImage} />
            <meta property="og:image:width" content="538" />
            <meta property="og:image:height" content="341" />
            <meta name="google-site-verification" content="n1IATAh14MmCQacvLLboLaSlNHgEU2VJ9fR23FYP-sQ" />

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Meet Your Mate",
                    "url": "https://www.meetyourmate.in",
                    "logo": "https://www.meetyourmate.in/images/mym_logos/mymshadow.png",
                    "contactPoint": [
                        {
                            "@type": "ContactPoint",
                            "telephone": "+91-9027495997",
                            "contactType": "customer service"
                        },
                        {
                            "@type": "ContactPoint",
                            "telephone": "+91-6395809873",
                            "contactType": "customer service"
                        }
                    ]
                })
            }} />

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "url": "https://www.meetyourmate.in",
                    "name": "Meet Your Mate",
                    "description": "Discover a new way to connect with fellow students at Meet Your Mate. Share secrets, chat anonymously, and forge meaningful connections with your college community. Join today and unlock a world of friendships and support.",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Meet Your Mate",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.meetyourmate.in/images/mym_logos/mymshadow.png"
                        }
                    }
                })
            }} />

        </Head>
    );
};

export default CustomHead;
