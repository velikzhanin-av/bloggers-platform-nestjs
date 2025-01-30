const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 3000 });

  // Публичный URL, который можно использовать для доступа к локальному серверу
  console.log('Tunnel URL:', tunnel.url);

  // // Закрыть туннель при завершении
  // tunnel.on('close', () => {
  //   console.log('Tunnel closed');
  // });
})();