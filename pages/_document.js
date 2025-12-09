import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to Google Fonts for faster loading */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Link to Google Fonts for Inter font - using display=swap for non-blocking */}
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Dancing+Script&display=swap"/>
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Move analytics scripts to end of body for non-blocking load */}
          {/* Google Analytics */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-MVLJQ1YYLG"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-MVLJQ1YYLG');
              `,
            }}
          />
          {/* Microsoft Clarity - deferred */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "ui8pqmdfpb");
              `,
            }}
          />
        </body>
      </Html>
    );
  }
}
