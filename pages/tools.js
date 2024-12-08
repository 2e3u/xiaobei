// 获取DOM元素
const searchInput = document.getElementById('toolSearch');
const filterTags = document.querySelectorAll('.filter-tag');
const toolSections = document.querySelectorAll('.tool-section');
const contentContainer = document.querySelector('.content-container');

// 搜索功能
searchInput.addEventListener('input', filterTools);

// 标签筛选
filterTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 设置最小高度以防止内容收缩
        const currentHeight = contentContainer.offsetHeight;
        contentContainer.style.minHeight = `${currentHeight}px`;
        
        // 移除其他标签的active状态
        filterTags.forEach(t => t.classList.remove('active'));
        // 添加当前标签的active状态
        tag.classList.add('active');
        
        const selectedCategory = tag.dataset.filter;
        
        // 显示/隐藏对应类别的部分
        toolSections.forEach(section => {
            if (selectedCategory === 'all' || section.dataset.category === selectedCategory) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });
    });
});

// 搜索筛选功能
function filterTools() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-tag.active').dataset.filter;

    // 设置最小高度以防止内容收缩
    const currentHeight = contentContainer.offsetHeight;
    contentContainer.style.minHeight = `${currentHeight}px`;

    toolSections.forEach(section => {
        const cards = section.querySelectorAll('.tool-card');
        let hasVisibleCards = false;

        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            
            if (matchesSearch && (activeFilter === 'all' || section.dataset.category === activeFilter)) {
                card.style.display = '';
                hasVisibleCards = true;
            } else {
                card.style.display = 'none';
            }
        });

        section.style.display = hasVisibleCards ? '' : 'none';
    });
} 