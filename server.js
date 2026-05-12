const fs = require('fs');
const https = require('https');
const url = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./certs/whspr.key'),
  cert: fs.readFileSync('./certs/whspr.crt'),
};

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 443;

app.prepare().then(() => {
  https.createServer(httpsOptions, (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> HTTPS server ready on https://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start HTTPS server:', err);
  process.exit(1);
});