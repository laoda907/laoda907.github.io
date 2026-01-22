// ===== 我的网站特效 - 保存修复版 =====
console.log('🔧 脚本加载开始');

// 1. 下雪功能（不变）
let snowTimer = null;
function createSnow() {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 8 + 4;
    flake.style.width = flake.style.height = size + 'px';
    flake.style.opacity = Math.random() * 0.6 + 0.2;
    document.body.appendChild(flake);
    setTimeout(() => flake.remove(), 4000);
}
function startSnow() { if (snowTimer) return; for (let i=0; i<25; i++) setTimeout(createSnow, i*80); snowTimer = setInterval(createSnow, 150); }
function stopSnow() { if (snowTimer) { clearInterval(snowTimer); snowTimer = null; } }

// 2. 核心修复：让所有文字都能保存
function fixAllTextSaving() {
    console.log('🔄 开始修复文字保存...');
    
    // 所有可编辑元素的固定身份标识（按页面顺序）
    // 这个列表必须和页面上显示的顺序完全一致
    const textElements = [
        { selector: '#mainTitle', default: '欢迎来到我的动态网站！' },
        { selector: '#subTitle', default: '晃动你的手机，开始下雪吧！' },
        { selector: '#curtainText', default: '在这里写下你的灵感...<br>(点击直接编辑)' },
        { selector: '#content1', default: '这个区域的所有文字也是可以点击编辑的。' },
        { selector: '#content2', default: '编辑后，即使关闭浏览器，下次打开时内容也会保留。' }
    ];
    
    let fixedCount = 0;
    
    textElements.forEach((item, index) => {
        const el = document.querySelector(item.selector);
        if (!el) {
            console.warn('⚠️ 未找到元素：', item.selector);
            return;
        }
        
        // 给元素一个永久的、唯一的存储键
        // 使用固定的键名，避免随机生成导致不匹配
        const storageKey = 'text_' + (index + 1);
        el.dataset.saveKey = storageKey; // 保存在元素属性里
        
        console.log(`处理 ${item.selector} -> 存储键: ${storageKey}`);
        
        // 设为可编辑
        el.setAttribute('contenteditable', 'true');
        
        // 尝试加载保存的内容
        const saved = localStorage.getItem(storageKey);
        if (saved !== null && saved !== '') {
            el.innerHTML = saved;
            console.log(`  ✅ 已加载保存内容`);
            fixedCount++;
        } else {
            // 如果是第一次，确保默认值被保存
            localStorage.setItem(storageKey, item.default);
            console.log(`  📝 设置默认值并保存`);
        }
        
        // 输入时自动保存
        let saveTimer;
        el.addEventListener('input', function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                localStorage.setItem(storageKey, this.innerHTML);
                console.log(`  💾 实时保存: ${storageKey}`);
            }, 400);
        });
        
        // 视觉反馈
        el.addEventListener('focus', function() {
            this.style.outline = '3px solid #00ff00';
            this.style.boxShadow = '0 0 15px rgba(0,255,0,0.5)';
        });
        el.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.boxShadow = '';
        });
    });
    
    console.log(`✅ 修复完成。已处理 ${fixedCount} 个元素的保存问题。`);
    return fixedCount;
}

// 3. 页面加载
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 页面加载完成');
    
    // 修复保存问题
    const fixed = fixAllTextSaving();
    
    // 如果修复了0个，说明可能是首次运行
    if (fixed === 0) {
        console.log('ℹ️ 首次运行，所有内容已设置为默认值并保存');
    }
    
    // 全局函数
    window.startSnowfall = startSnow;
    window.stopSnowfall = stopSnow;
    
    // 添加手动保存按钮（用于测试）
    setTimeout(() => {
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '💾 保存测试';
        saveBtn.style.cssText = `
            position: fixed; bottom: 70px; right: 15px;
            z-index: 9999; padding: 8px 12px;
            background: #2196F3; color: white;
            border: none; border-radius: 15px;
            font-size: 13px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        saveBtn.onclick = function() {
            const keys = ['text_1', 'text_2', 'text_3', 'text_4', 'text_5'];
            let result = '当前保存状态：\n\n';
            keys.forEach(key => {
                const content = localStorage.getItem(key);
                result += `${key}: ${content ? '✅ 已保存' : '❌ 未保存'}\n`;
                if (content) result += `  内容: "${content.substring(0, 15)}..."\n`;
            });
            alert(result);
        };
        document.body.appendChild(saveBtn);
        console.log('🛠️ 保存测试按钮已添加');
    }, 1500);
});

// 启动完成提示
setTimeout(() => {
    console.log('🚀 网站准备就绪');
    console.log('📊 已保存项目:', Object.keys(localStorage).length);
}, 2000);
