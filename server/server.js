const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// CORS 配置
app.use(cors({
    origin: [
        'http://2e3u.github.io',
        'https://2e3u.github.io',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://www.2772686562.com.cn',
        'https://2772686562.com.cn'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// 增加请求体大小限制
app.use(bodyParser.json({ limit: '1mb' }));

// 创建临时文件目录
const tempDir = path.join(__dirname, 'temp');
fs.mkdir(tempDir, { recursive: true }).catch(console.error);

// 健康检查端点
app.get('/health', (req, res) => {
    // 检查 GCC 是否可用
    exec('gcc --version', (error) => {
        if (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'GCC 未安装或不可用' 
            });
        }
        res.json({ status: 'ok', message: '服务器正常运行' });
    });
});

app.post('/compile', async (req, res) => {
    console.log('收到编译请求');
    
    // 验证请求体
    if (!req.body || !req.body.code) {
        return res.status(400).json({
            success: false,
            error: '无效的请求：缺少代码'
        });
    }

    const { code, input } = req.body;
    const id = uuidv4();
    const sourceFile = path.join(tempDir, `${id}.c`);
    const inputFile = path.join(tempDir, `${id}.txt`);
    const outputFile = path.join(tempDir, `${id}${process.platform === 'win32' ? '.exe' : ''}`);

    // 清理函数
    const cleanup = async () => {
        try {
            await fs.unlink(sourceFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            if (input) {
                await fs.unlink(inputFile).catch(() => {});
            }
        } catch (err) {
            console.error('清理文件错误:', err);
        }
    };

    try {
        // 写入源代码文件
        console.log('写入源文件:', sourceFile);
        await fs.writeFile(sourceFile, code);
        if (input) {
            console.log('写入输入文件:', inputFile);
            await fs.writeFile(inputFile, input);
        }

        // 编译代
        const compileCommand = `gcc "${sourceFile}" -o "${outputFile}"`;
        console.log('执行编译命令:', compileCommand);
        
        exec(compileCommand, { timeout: 10000 }, async (error, stdout, stderr) => {
            if (error) {
                console.error('编译错误:', stderr);
                await cleanup();
                return res.json({ success: false, error: stderr });
            }

            // 运行程序
            const runCommand = input 
                ? `"${outputFile}" < "${inputFile}"`
                : `"${outputFile}"`;
            
            console.log('执行程:', runCommand);

            exec(runCommand, { timeout: 5000 }, async (error, stdout, stderr) => {
                await cleanup();

                if (error) {
                    console.error('运行错误:', stderr);
                    return res.json({ success: false, error: stderr });
                }

                console.log('执行成功，输出:', stdout);
                res.json({ success: true, output: stdout });
            });
        });
    } catch (error) {
        console.error('服务器错误:', error);
        await cleanup();
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    console.log(`编译服务器运行在 http://localhost:${port}`);
    console.log('支持的路由:');
    console.log('- GET /health: 健康检查');
    console.log('- POST /compile: 编译和运行代码');
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，准备关闭服务器...');
    cleanup();
    process.exit(0);
}); 