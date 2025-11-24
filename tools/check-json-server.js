const jsonServer = require('json-server');
const http = require('http');
const path = require('path');

async function startAndCheck() {
  const server = jsonServer.create();
  const router = jsonServer.router(path.resolve(__dirname, '..', 'db.json'));
  const middlewares = jsonServer.defaults();

  server.use(middlewares);
  server.use(router);

  const listener = server.listen(0, () => {
    const port = listener.address().port;
    console.log('json-server started on port', port);

    // Check /projects
    http.get({ hostname: '127.0.0.1', port, path: '/projects', timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('/projects -> OK, found', Array.isArray(parsed) ? parsed.length : 'n/a', 'items');
        } catch (e) {
          console.error('Failed parsing /projects response');
        }

        // Check relation: /projects/1/tasks
        http.get({ hostname: '127.0.0.1', port, path: '/projects/1/tasks', timeout: 2000 }, (res2) => {
          let d2 = '';
          res2.on('data', (c) => (d2 += c));
          res2.on('end', () => {
            try {
              const parsed2 = JSON.parse(d2);
              console.log('/projects/1/tasks -> OK, found', Array.isArray(parsed2) ? parsed2.length : 'n/a', 'items');
            } catch (e) {
              console.error('Failed parsing /projects/1/tasks response');
            }
            listener.close(() => process.exit(0));
          });
        }).on('error', (err) => {
          console.error('Error requesting /projects/1/tasks:', err.message);
          listener.close(() => process.exit(2));
        });
      });
    }).on('error', (err) => {
      console.error('Error requesting /projects:', err.message);
      listener.close(() => process.exit(2));
    });
  });
}

startAndCheck();
