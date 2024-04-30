import React from 'react';
import Head from 'next/head';

const CustomHead = ({ title, description, keywords, seoImage }) => {
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="https://www.meetyourmate.in/images/mym_logos/mymshadow.png" />
            <meta
                property="og:keywords"
                content={keywords.join(", ")}
            />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={`meetyourmate.in`} />
            <meta property="og:site_name" content="MYM" />
            <meta name="twitter:title" content={title} key="tw-title" />
            <meta name="twitter:description" content={description} key="tw-desc" />
            <meta name="twitter:card" content="summary_large_image" key="tw-card" />
            <meta name="keywords" content={keywords.join(", ")} />
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

CustomHead.defaultProps = {
    title: 'Share Your Secrets Anonymously | MYM',
    description: "Join the anonymous community at MyM and share your deepest confessions with fellow students. Discover the thrill of chatting with random classmates and students from other colleges too and explore a world of secrets and connections.",
    keywords: ['omegle', 'omegle.com', 'confessions', 'college confessions', 'hbtu', 'hbtu confessions', 'anonymous confessions', 'chat with classmates', 'student community', 'secret sharing', 'anonymous messaging', 'college secrets'],
    seoImage: 'https://www.meetyourmate.in/images/mym_logos/mymshadow.png',
};

export default CustomHead;
