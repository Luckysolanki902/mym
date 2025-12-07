export const emailStyles = {
  container: `
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #eaeaea;
  `,
  header: `
    background: linear-gradient(135deg, #ff4b4b 0%, #ff9068 100%);
    padding: 30px 20px;
    text-align: center;
  `,
  logo: `
    color: white;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -1px;
    margin: 0;
    text-transform: lowercase;
  `,
  body: `
    padding: 40px 30px;
    color: #333333;
    line-height: 1.6;
  `,
  h1: `
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #1a1a1a;
    letter-spacing: -0.5px;
  `,
  p: `
    font-size: 16px;
    color: #555555;
    margin-bottom: 25px;
  `,
  highlight: `
    background-color: #fff0f0;
    padding: 15px;
    border-left: 4px solid #ff4b4b;
    font-style: italic;
    color: #444;
    margin-bottom: 25px;
    border-radius: 4px;
  `,
  buttonContainer: `
    text-align: center;
    margin: 35px 0;
  `,
  button: `
    background-color: #ff4b4b;
    color: white !important;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 16px;
    display: inline-block;
    box-shadow: 0 4px 15px rgba(255, 75, 75, 0.3);
    transition: transform 0.2s;
  `,
  footer: `
    background-color: #f9f9f9;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #999999;
    border-top: 1px solid #eaeaea;
  `,
  link: `
    color: #ff4b4b;
    text-decoration: none;
  `
};

export const wrapTemplate = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.logo}">spyll</h1>
      </div>
      <div style="${emailStyles.body}">
        ${content}
      </div>
      <div style="${emailStyles.footer}">
        <p>You received this because you're part of the Spyll community.</p>
        <p>© ${new Date().getFullYear()} Spyll. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;
