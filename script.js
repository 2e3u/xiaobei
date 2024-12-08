document.addEventListener('DOMContentLoaded', function() {
    const heroChatInput = document.getElementById('hero-chat-input');
    const heroChatBtn = document.querySelector('.hero-chat-btn');
    const chatField = document.querySelector('.chat-field');
    const chatDialog = document.querySelector('.chat-dialog');
    const toolSearch = document.getElementById('toolSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const toolItems = document.querySelectorAll('.tool-item');

    // 阻止整个聊天区域的默认事件
    const heroChat = document.querySelector('.hero-chat');
    heroChat.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    // 添加更丰富的AI回复逻辑
    const aiResponses = {
        greeting: [
            '你好！我是王小北的AI助手，很高兴见到你！',
            '嗨！欢迎来到我的AI学习之旅，有什么我可以帮你的吗？',
            '你好啊！让我们开始探讨AI的精彩世界吧！'
        ],
        about: [
            '我是王小北的AI助手，专注于分享AI学习经验和心得。',
            '作为一个AI助手，我可以和你分享王小北在AI领域的学习历程。',
            '我的目标是帮助每个对AI感兴趣的人更好地理解和学习AI技术。'
        ],
        stable_diffusion: [
            '说到Stable Diffusion，这是一个非常强大的AI绘画模型。从基础的提示词编写，到模型训练，每个阶段都很有趣。',
            'Stable Diffusion的学习可以从基础的界面操作开始，然后逐步深入到提示词编写、参数调整，最后是模型训练和优化。',
            '在学习Stable Diffusion的过程中，最重要的是要多实践，多尝试不同的提示词和参数组合。'
        ],
        learning: [
            '学习AI需要循序渐进，建议先从基础概念开始，比如了解什么是机器学习、深度学习等。',
            '在AI学习过程中，实践很重要。建议选择一个具体方向，如Stable Diffusion，深入学习和实践。',
            '学习AI最重要的是保持好奇心和耐心，因为这个领域在不断发展和进步。'
        ],
        project: [
            '在我的作品集中有很多使用Stable Diffusion创作的作品，每一个都代表了不同阶段的学习成果。',
            '通过实践项目来学习是最好的方式，可以从简单的图片生成开始，逐步尝试更复杂的创作。',
            '我会不断更新我的作品集，展示最新的学习成果和创作灵感。'
        ],
        default: [
            '这是一个很好的问题！让我从AI学习的角度来分析...',
            '你提到的这点很有趣，在AI学习过程中...',
            '这确实是AI学习中的一个重要话题...'
        ]
    };

    // 添加打字机效果
    function typeWriter(element, text, speed = 30) {
        let i = 0;
        element.innerHTML = '';
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // 改进的消息处理函数
    function handleChat(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const message = heroChatInput.value.trim();
        if (!message) return;

        const currentScroll = window.scrollY;
        chatDialog.classList.add('active');
        
        // 添加用户消息
        addMessage(message, 'user');
        heroChatInput.value = '';
        
        window.scrollTo({
            top: currentScroll,
            behavior: 'instant'
        });
        
        // 添加思考动画
        const thinkingMessage = addMessage('...', 'ai thinking');
        
        // 智能回复逻辑
        setTimeout(() => {
            const response = getResponse(message);
            // 移除思考动画
            thinkingMessage.remove();
            
            // 添加AI回复
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai';
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            messageDiv.appendChild(contentDiv);
            
            const chatMessages = chatDialog.querySelector('.chat-messages');
            chatMessages.appendChild(messageDiv);
            
            // 使用打字机效果显示回复
            typeWriter(contentDiv, response);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            window.scrollTo({
                top: currentScroll,
                behavior: 'instant'
            });
        }, 1500);
    }

    // 改进的消息添加函数
    function addMessage(text, type) {
        const chatMessages = chatDialog.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        if (type === 'ai thinking') {
            messageDiv.innerHTML = `
                <div class="message-content thinking">
                    <span class="dot">.</span>
                    <span class="dot">.</span>
                    <span class="dot">.</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${text}
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // 输入框事件处理
    heroChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handleChat();
            return false;
        }
    });

    // 发送按钮事件处理
    heroChatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleChat();
        return false;
    });

    // 阻止冒泡
    [chatField, chatDialog, heroChatInput].forEach(element => {
        ['click', 'keydown', 'keypress', 'keyup', 'submit'].forEach(eventType => {
            element.addEventListener(eventType, (e) => {
                e.stopPropagation();
            });
        });
    });

    // 阻止表单提交
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            return false;
        });
    });

    // 在handleChat函数中修改回复逻辑
    function getResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // 更智能的关键词匹配
        if (lowerMessage.includes('你好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
            return aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
        }
        
        if (lowerMessage.includes('你是谁') || lowerMessage.includes('介绍') || lowerMessage.includes('是什么')) {
            return aiResponses.about[Math.floor(Math.random() * aiResponses.about.length)];
        }
        
        if (lowerMessage.includes('stable') || lowerMessage.includes('diffusion') || lowerMessage.includes('绘画')) {
            return aiResponses.stable_diffusion[Math.floor(Math.random() * aiResponses.stable_diffusion.length)];
        }
        
        if (lowerMessage.includes('学习') || lowerMessage.includes('怎么学') || lowerMessage.includes('教程')) {
            return aiResponses.learning[Math.floor(Math.random() * aiResponses.learning.length)];
        }
        
        if (lowerMessage.includes('作品') || lowerMessage.includes('项目') || lowerMessage.includes('案例')) {
            return aiResponses.project[Math.floor(Math.random() * aiResponses.project.length)];
        }

        // 如果没有匹配到关键词，生成上下文相关的回复
        let response = aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
        response += '\n\n你可以问我关于AI学习、Stable Diffusion使用、项目经验等方面的问题。';
        
        return response;
    }

    // 搜索功能
    toolSearch.addEventListener('input', filterTools);

    // 分类筛选
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTools();
        });
    });

    function filterTools() {
        const searchTerm = toolSearch.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

        toolItems.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            const category = item.dataset.category;
            
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            item.style.display = matchesSearch && matchesCategory ? 'flex' : 'none';
        });
    }
}); 