// 全局变量
let neuralNetwork;
let skillsChart;
let echartsLoading = false;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initNeuralBackground();
    initTypingEffect();
    
    // 延迟初始化技能图表，确保 DOM 完全就绪
    setTimeout(() => {
        initSkillsChart();
    }, 100);
    
    initMobileMenu();
    initScrollAnimations();
    initSkillNodes();
});

// 初始化神经网络背景
function initNeuralBackground() {
    const sketch = (p) => {
        let nodes = [];
        let connections = [];
        
        p.setup = () => {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('neural-bg');
            
            // 创建节点
            for (let i = 0; i < 50; i++) {
                nodes.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-1, 1),
                    vy: p.random(-1, 1),
                    size: p.random(2, 6)
                });
            }
        };
        
        p.draw = () => {
            p.clear();
            
            // 更新节点位置
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                
                // 边界反弹
                if (node.x < 0 || node.x > p.width) node.vx *= -1;
                if (node.y < 0 || node.y > p.height) node.vy *= -1;
            });
            
            // 绘制连接线
            p.stroke(255, 107, 53, 30);
            p.strokeWeight(1);
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    let dist = p.dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    if (dist < 100) {
                        p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    }
                }
            }
            
            // 绘制节点
            p.fill(255, 107, 53, 100);
            p.noStroke();
            nodes.forEach(node => {
                p.ellipse(node.x, node.y, node.size);
            });
        };
        
        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    };
    
    neuralNetwork = new p5(sketch);
}

// 初始化打字机效果
function initTypingEffect() {
    const texts = [
        '独立AI研究员',
        'LLM架构优化专家',
        '强化学习算法工程师',
        'CUDA计算优化专家',
        '开源项目贡献者',
        'AAAI PC成员'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeText() {
        const currentText = texts[textIndex];
        const typingElement = document.getElementById('typing-text');
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }
        
        setTimeout(typeText, typingSpeed);
    }
    
    typeText();
}

// ECharts 加载函数（支持多CDN源）
function loadECharts() {
    return new Promise((resolve, reject) => {
        // 如果已加载，直接返回
        if (typeof window.echarts !== 'undefined') {
            resolve(window.echarts);
            return;
        }
        
        // 尝试多个 CDN 源
        const cdnSources = [
            'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
            'https://unpkg.com/echarts@5.4.3/dist/echarts.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js'
        ];
        
        let currentIndex = 0;
        
        function tryLoadCDN() {
            if (currentIndex >= cdnSources.length) {
                reject(new Error('所有 ECharts CDN 源均加载失败'));
                return;
            }
            
            const script = document.createElement('script');
            script.src = cdnSources[currentIndex];
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                if (typeof window.echarts !== 'undefined') {
                    resolve(window.echarts);
                } else {
                    currentIndex++;
                    tryLoadCDN();
                }
            };
            
            script.onerror = () => {
                console.warn(`ECharts CDN 加载失败: ${cdnSources[currentIndex]}`);
                currentIndex++;
                tryLoadCDN();
            };
            
            document.head.appendChild(script);
        }
        
        tryLoadCDN();
    });
}

// 初始化技能雷达图（带错误处理和重试机制）
async function initSkillsChart() {
    if (echartsLoading) return;
    echartsLoading = true;
    
    const chartDom = document.getElementById('skills-chart');
    if (!chartDom) {
        console.error('Skills chart container not found');
        echartsLoading = false;
        return;
    }
    
    // 尝试加载 ECharts
    try {
        // 等待 ECharts 加载（包括备用 CDN）
        await loadECharts();
        
        // 再次检查是否加载成功
        if (typeof window.echarts === 'undefined') {
            throw new Error('ECharts library failed to load');
        }
        
        // 确保容器可见且有尺寸
        if (chartDom.offsetWidth === 0 || chartDom.offsetHeight === 0) {
            console.warn('Chart container has zero size, retrying...');
            setTimeout(() => initSkillsChart(), 500);
            return;
        }
        
        // 初始化图表
        skillsChart = window.echarts.init(chartDom);
        
        const option = {
            backgroundColor: 'transparent',
            radar: {
                indicator: [
                    { name: 'LLM架构', max: 100 },
                    { name: '强化学习', max: 100 },
                    { name: 'CUDA优化', max: 100 },
                    { name: '测试时扩展', max: 100 },
                    { name: '算法设计', max: 100 },
                    { name: '系统架构', max: 100 }
                ],
                shape: 'polygon',
                splitNumber: 4,
                axisName: {
                    color: '#fff',
                    fontSize: 12
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 107, 53, 0.3)'
                    }
                },
                splitArea: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 107, 53, 0.5)'
                    }
                }
            },
            series: [{
                name: '技能水平',
                type: 'radar',
                data: [{
                    value: [92, 96, 84, 95, 90, 80],
                    name: '技术能力',
                    areaStyle: {
                        color: 'rgba(255, 107, 53, 0.3)'
                    },
                    lineStyle: {
                        color: '#ff6b35',
                        width: 2
                    },
                    itemStyle: {
                        color: '#ff6b35'
                    }
                }],
                animationDuration: 2000,
                animationEasing: 'cubicOut'
            }]
        };
        
        skillsChart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            if (skillsChart) {
                skillsChart.resize();
            }
        });
        
        console.log('Skills chart initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize skills chart:', error);
        
        // 显示友好的错误提示
        chartDom.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; color: #ff6b35;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p style="margin-top: 1rem; font-size: 0.875rem;">图表加载失败</p>
                <p style="font-size: 0.75rem; color: #888;">请检查网络连接或刷新页面</p>
            </div>
        `;
        
        // 3秒后自动重试
        setTimeout(() => {
            echartsLoading = false;
            initSkillsChart();
        }, 3000);
        
    } finally {
        echartsLoading = false;
    }
}

// 初始化移动端菜单
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    
    // 点击菜单项后关闭菜单
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// 初始化滚动动画
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    const animateElements = document.querySelectorAll('.project-card, .achievement-badge');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// 初始化技能节点动画
function initSkillNodes() {
    // 基础数据
    const allSkills = [
        { name: 'Transformer', x: 8, y: 18 },
        { name: 'Meta-RL', x: 70, y: 20 },
        { name: 'CUDA', x: 75, y: 85 },
        { name: 'FlashAttention', x: 12, y: 88 },
        { name: 'MoE', x: 92, y: 45 },
        { name: 'SSL-RL', x: 10, y: 65 },
        { name: 'U-RL', x: 90, y: 15 },
        { name: 'TestTime', x: 55, y: 28 },
        { name: 'RLIF', x: 70, y: 75 },
        { name: 'LLM', x: 35, y: 42 },
        { name: 'RLVP', x: 50, y: 75 },
        { name: 'Actor-Critic', x: 30, y: 15 },
    ];

    // 移动端只显示核心技能（减少50%）
    const skills = isMobileDevice() 
        ? allSkills
        // ? allSkills.filter((_, i) => i % 2 === 0) // 取偶数索引
        : allSkills;

    // 防抖重叠检测与调整
    const minDistance = isMobileDevice() ? 60 : 120;;  // 移动端减小最小间距
    const iterations = 5; // 调整迭代次数
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    
    // 转换为像素坐标
    const nodes = skills.map(skill => ({
        name: skill.name,
        x: (skill.x / 100) * viewport.width,
        y: (skill.y / 100) * viewport.height,
        originalX: (skill.x / 100) * viewport.width,
        originalY: (skill.y / 100) * viewport.height
    }));

    // 碰撞检测与调整
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance && distance > 0) {
                    // 计算推开方向
                    const force = (minDistance - distance) / distance;
                    const fx = dx * force * 0.5;
                    const fy = dy * force * 0.5;
                    
                    // 应用推开力
                    nodes[i].x -= fx;
                    nodes[i].y -= fy;
                    nodes[j].x += fx;
                    nodes[j].y += fy;
                }
            }
        }
    }

    // 边界检测与回归
    const nodeSize = 100; // 节点直径（像素）
    nodes.forEach(node => {
        const halfSize = nodeSize / 2;
        const margin = 30;
        
        // 限制在视口内
        node.x = Math.max(halfSize + margin, Math.min(viewport.width - halfSize - margin, node.x));
        node.y = Math.max(halfSize + margin, Math.min(viewport.height - halfSize - margin, node.y));
        
        // 添加随机微扰动（避免完全规则）
        node.x += (Math.random() - 0.5) * 20;
        node.y += (Math.random() - 0.5) * 20;
        
        // 转回百分比
        node.xPercent = (node.x / viewport.width) * 100;
        node.yPercent = (node.y / viewport.height) * 100;
    });

    // 延迟渲染
    setTimeout(() => {
        nodes.forEach((node, index) => {
            setTimeout(() => {
                createSkillNode(node.name, node.xPercent, node.yPercent);
            }, index * 200 + Math.random() * 200);
        });
    }, 800);
}

// 检测是否为移动端
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 创建技能节点（带移动端优化）
function createSkillNode(name, xPercent, yPercent) {
    const node = document.createElement('div');
    node.className = 'skill-node';
    node.textContent = name;
    
    // 响应式尺寸：移动端40px，桌面端80px
    const size = isMobileDevice() ? 40 : 80;
    const fontSize = isMobileDevice() ? 10 : 12;
    const opacity = isMobileDevice() ? 0.3 : 0.8; // 移动端更透明
    
    node.style.cssText = `
        position: absolute;
        left: ${xPercent}%;
        top: ${yPercent}%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${fontSize}px;
        font-weight: bold;
        text-align: center;
        z-index: 5; // 降低层级，不遮挡内容
        opacity: 0;
        transform: scale(0);
    `;
    
    document.body.appendChild(node);
    
    // 简化移动端动画
    const animationConfig = {
        targets: node,
        opacity: [0, opacity],
        scale: [0, 1],
        duration: isMobileDevice() ? 600 : 1000, // 移动端动画更快
        easing: isMobileDevice() ? 'easeOutQuad' : 'easeOutElastic(1, .8)'
    };
    
    anime(animationConfig);
}

// 平滑滚动到指定元素
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 导航链接点击处理
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        scrollToElement(targetId);
    }
});

// 页面滚动效果
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.neural-bg');
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// 添加CSS动画类
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .skill-node {
        box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
    }
    
    .skill-node:hover {
        box-shadow: 0 0 30px rgba(255, 107, 53, 0.8);
        z-index: 20;
    }
`;
document.head.appendChild(style);
