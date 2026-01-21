// 1. 晃动手机触发下雪效果
let snowInterval;
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(e) {
        if ((Math.abs(e.gamma) > 30 || Math.abs(e.beta) > 30) && !snowInterval) {
            startSnowfall();
            setTimeout(stopSnowfall, 5000);
        }
    });
}

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.width = snowflake.style.height = (Math.random() * 10 + 5) + 'px';
    snowflake.style.opacity = Math.random() * 0.5 + 0.3;
    snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
    document.body.appendChild(snowflake);
    setTimeout(() => { if (snowflake.parentNode) snowflake.remove(); }, 5000);
}

function startSnowfall() {
    if (snowInterval) return;
    for (let i = 0; i < 30; i++) setTimeout(createSnowflake, i * 100);
    snowInterval = setInterval(createSnowflake, 200);
}

function stopSnowfall() {
    clearInterval(snowInterval);
    snowInterval = null;
}

// 2. 核心修复：确保所有文字可编辑，特别是窗帘区域
function initEditableText() {
    // 主选择器：所有带 editable 或 editable-text 类的元素
    const mainElements = document.querySelectorAll('.editable, .editable-text');
    
    mainElements.forEach(el => {
        enableEditing(el);
    });
    
    // 特殊处理：确保窗帘区域文字被捕获（通过更精确的选择器）
    const curtainText = document.querySelector('.curtain .editable-text');
    if (curtainText && !curtainText.hasAttribute('contenteditable')) {
        console.log('特殊初始化窗帘文字');
        enableEditing(curtainText);
    }
    
    console.log(`已初始化 ${mainElements.length} 处可编辑文字`);
}

// 启用编辑功能的通用函数
function enableEditing(element) {
    if (!element || element.hasAttribute('contenteditable')) return;
    
    element.setAttribute('contenteditable', 'true');
    const storageKey = element.id || 'edit_' + element.className + '_' + Math.random().toString(36).substr(2, 5);
    
    // 加载保存的内容
    const saved = localStorage.getItem(storageKey);
    if (saved) element.innerHTML = saved;
    
    // 保存编辑
    element.addEventListener('blur', function() {
        localStorage.setItem(storageKey, this.innerHTML);
        console.log('已保存:', storageKey);
    });
    
    // 添加视觉反馈（编辑时边框变色）
    element.addEventListener('focus', function() { this.style.borderColor = '#4CAF50'; });
    element.addEventListener('blur', function() { this.style.borderColor = 'rgba(255, 255, 255, 0.5)'; });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 第一次初始化
    initEditableText();
    
    // 延迟再次初始化，确保动态内容已就绪（针对窗帘特效区域）
    setTimeout(initEditableText, 500);
    
    // 全局函数供按钮调用
    window.startSnowfall = startSnowfall;
    window.stopSnowfall = stopSnowfall;
});
