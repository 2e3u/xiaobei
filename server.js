const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const https = require('https');
const fs = require('fs');

// 设置更长的超时时间
app.use((req, res, next) => {
    req.socket.setTimeout(120000); // 设置为2分钟
    next();
});

// 添加 keep-alive 支持
app.use((req, res, next) => {
    res.set('Connection', 'keep-alive');
    res.set('Keep-Alive', 'timeout=120');
    next();
});

// 修改 CORS 配置
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://您的域名',
        'https://您的域名',
        'http://www.2772686562.com.cn',
        'https://www.2772686562.com.cn',
        'http://2772686562.com.cn',
        'https://2772686562.com.cn',
        'null',  // 允许来自直接文件访问的请求
        '*'      // 允许所有来源（开发环境下使用）
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    // 添加更多必要的安全头信息
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // 添加安全相关的响应头
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.static('.')); // 服务静态文件

// 添加健康检查端
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).send('服务器错误');
});

function tryPort(port) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`正在尝试启动服务器在端口 ${port}...`);
            const server = app.listen(port, '0.0.0.0', () => {
                console.log(`服务器运行在端口 ${port}`);
            })
                .on('listening', () => {
                    try {
                        server.keepAliveTimeout = 120000;
                        server.headersTimeout = 120000;
                        
                        console.log(`服务器成功启动在端口 ${port}`);
                        console.log(`本地访问: http://localhost:${port}`);
                        console.log(`局域网访问: http://${getLocalIP()}:${port}`);
                        resolve(server);
                    } catch (err) {
                        console.error('服务器配置过程中发生错误:', err);
                        reject(err);
                    }
                })
                .on('error', (err) => {
                    console.error(`启动端口 ${port} 时发生错误:`, err.message);
                    if (err.code === 'EADDRINUSE') {
                        console.log(`端口 ${port} 被占用，尝试端口 ${port + 1}`);
                        tryPort(port + 1).then(resolve).catch(reject);
                    } else {
                        reject(err);
                    }
                });
        } catch (err) {
            console.error('创建服务器实例时发生错误:', err);
            reject(err);
        }
    });
}

// 修改启动逻辑，添加更详细的错误处理
tryPort(port).catch(err => {
    console.error('服务器启动失败，详细错误:', err);
    console.error('错误堆栈:', err.stack);
    process.exit(1);
});

// 修改 SSL 证书处理逻辑
const sslPath = '/etc/letsencrypt/live/www.2772686562.com.cn/';

// 添加同步检查证书文件是否存在的函数
function checkSSLCertificates(path) {
    try {
        const certFile = path + 'fullchain.pem';
        const keyFile = path + 'privkey.pem';
        return fs.existsSync(certFile) && fs.existsSync(keyFile);
    } catch (err) {
        return false;
    }
}

// 使用新的检查函数
if (checkSSLCertificates(sslPath)) {
    try {
        const httpsPort = 8443; // 使用替代端口
        const options = {
            cert: fs.readFileSync(sslPath + 'fullchain.pem'),
            key: fs.readFileSync(sslPath + 'privkey.pem')
        };

        https.createServer(options, app).listen(httpsPort, () => {
            console.log(`HTTPS 服务器运行在端口 ${httpsPort}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`端口 ${httpsPort} 已被占用，请选择其他端口`);
            } else {
                console.error('启动 HTTPS 服务器时发生错误:', err);
            }
            console.log('将只启动 HTTP 服务器');
        });
    } catch (err) {
        console.error('读取 SSL 证书文件失败:', err);
        console.log('将只启动 HTTP 服务器');
    }
} else {
    console.log('SSL 证书文件不存在或不完整。请确保已经正确安装 SSL 证书。');
    console.log('证书路径:', sslPath);
    console.log('将只启动 HTTP 服务器');
}

// 获取本地 IP 的辅助函数
function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}


