import { createApp } from './presentation/httpApp.js';

const PORT = Number(process.env.PORT) || 3000;

const app = createApp();
const server = app.listen(PORT, () => {
  console.log(`Restaurant API lab-4 http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Порт ${PORT} вже зайнятий іншим процесом (часто інший node або dev-сервер).\n` +
        'Варіанти: закрийте той процес або запустіть на іншому порту, наприклад:\n' +
        '  CMD:   set PORT=3010 && npm start\n' +
        '  PowerShell:  $env:PORT=3010; npm start\n' +
        'Щоб знайти PID у Windows: netstat -ano | findstr :' + PORT,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});