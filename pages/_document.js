import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* <link rel="icon" href="/images/mym_logos/mymlogoinvert.png" /> */}
          {/* Link to Google Fonts for Inter font */}
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Dancing+Script&display=swap"/>
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
          {/* Other head elements can be added here */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
