const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

const tryPort = (port) => {
  return new Promise((resolve, reject) => {
    console.log(`尝试启动服务器在端口 ${port}...`);
    
    const server = app.listen(port);
    
    server.on('listening', () => {
      console.log(`服务器成功运行在端口 ${port}`);
      resolve(server);
    });

    server.on('error', (err) => {
      console.error(`启动服务器时发生错误:`, err);
      
      if (err.code === 'EADDRINUSE') {
        console.log(`端口 ${port} 已被占用，尝试端口 ${port + 1}`);
        tryPort(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

tryPort(port).catch(err => {
  console.error('无法启动服务器:', err);
  process.exit(1);
}); 