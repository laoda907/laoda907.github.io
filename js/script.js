// ==================== 1. 晃动下雪效果 ====================
let snowInterval = null;

// 监听手机晃动
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(e) {
        // 当手机倾斜角度变化较大时触发下雪
        if ((Math.abs(e.gamma) > 30 || Math.abs(e.beta) > 30) && !snowInterval) {
            startSnowfall();
            // 5秒后自动停止
            setTimeout(stopSnowfall, 5000);
        }
    });
}

// 创建一片雪花
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 10 + 5;
    snowflake.style.width = size + 'px';
    snowflake.style.height = size + 'px';
    snowflake.style.opacity = Math.random() * 0.5 + 0.3;
    document.body.appendChild(snowflake);
    
    // 5秒后移除雪花
    setTimeout(() => {
        if (snowflake.parentNode) {
            snowflake.remove();
        }
    }, 5000);
}

// 开始下雪
function startSnowfall() {
    if (snowInterval) return; // 防止重复启动
    
    // 初始创建一批雪花
    for (let i = 0; i < 30; i++) {
        setTimeout(createSnowflake, i * 100);
    }
    // 持续生成新雪花
    snowInterval = setInterval(createSnowflake, 200);
}

// 停止下雪
function stopSnowfall() {
    if (snowInterval) {
        clearInterval(snowInterval);
        snowInterval = null;
    }
}

// ==================== 2. 文字编辑功能（核心修复版） ====================
// 为元素启用编辑功能
function enableEditing(element) {
    if (!element || element.hasAttribute('data-edit-initialized')) {
        return; // 防止重复初始化
    }
    
    // 标记已初始化
    element.setAttribute('data-edit-initialized', 'true');
    
    // 1. 设置为可编辑
    element.setAttribute('contenteditable', 'true');
    
    // 2. 生成稳定的存储键（核心修复）
    let storageKey = element.id ? 'edit_' + element.id : null;
    if (!storageKey) {
        // 基于元素内容生成一个哈希值作为稳定键
        const text = element.textContent.trim().substring(0, 30) || 'edit';
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        storageKey = 'edit_hash_' + Math.abs(hash);
        element.dataset.editKey = storageKey; // 保存到元素属性
    }
    
    console.log(`初始化编辑元素: ${storageKey}`);
    
    // 3. 加载已保存的内容
    const savedText = localStorage.getItem(storageKey);
    if (savedText !== null && savedText !== '') {
        element.innerHTML = savedText;
    }
    
    // 4. 输入时实时保存
    element.addEventListener('input', function() {
        localStorage.setItem(storageKey, this.innerHTML);
    });
    
    // 5. 视觉反馈
    element.addEventListener('focus', function() {
        this.style.borderColor = '#4CAF50';
        this.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    });
    
    element.addEventListener('blur', function() {
        this.style.borderColor = '';
        this.style.backgroundColor = '';
    });
}

// 初始化所有可编辑文本
function initAllEditableText() {
    // 通过选择器找到所有目标元素
    const elements = document.querySelectorAll('.editable, .editable-text');
    console.log(`找到 ${elements.length} 个可编辑元素`);
    
    elements.forEach(enableEditing);
    
    // 特殊检查：确保窗帘文字被处理（通过ID）
    const curtainText = document.getElementById('curtainText');
    if (curtainText && !curtainText.hasAttribute('data-edit-initialized')) {
        console.log('额外初始化窗帘文字（通过ID）');
        enableEditing(curtainText);
    }
}

// ==================== 3. 页面加载初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    
    // 初始化文字编辑功能
    initAllEditableText();
    
    // 延迟再次检查，确保动态内容已加载
    setTimeout(initAllEditableText, 300);
    
    // 将下雪函数设为全局，供按钮调用
    window.startSnowfall = startSnowfall;
    window.stopSnowfall = stopSnowfall;
    
    // 暴露调试函数（在浏览器控制台输入 manualFix() 可调用）
    window.manualFix = function() {
        console.log('手动重新初始化所有编辑功能');
        initAllEditableText();
        alert('已重新初始化。请点击窗帘文字测试。');
    };
});

// 控制台提示
console.log('特效脚本已加载。如需手动修复，请在控制台输入 manualFix()');
