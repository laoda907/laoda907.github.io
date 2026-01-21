// 1. 晃动手机触发下雪效果
let snowInterval;
// 检测手机晃动 (基于 deviceorientation 事件)
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(e) {
        // 简单的晃动判断：当手机倾斜角度变化较大时
        if ((Math.abs(e.gamma) > 30 || Math.abs(e.beta) > 30) && !snowInterval) {
            startSnowfall();
            // 5秒后自动停止下雪
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

    // 动画结束后移除雪花
    setTimeout(() => {
        if (snowflake.parentNode) {
            snowflake.remove();
        }
    }, 5000);
}

function startSnowfall() {
    if (snowInterval) return;
    for (let i = 0; i < 30; i++) {
        setTimeout(createSnowflake, i * 100);
    }
    snowInterval = setInterval(createSnowflake, 200);
}

function stopSnowfall() {
    clearInterval(snowInterval);
    snowInterval = null;
}

// 2. 使主界面的所有文字可编辑 (核心修复在这里)
document.addEventListener('DOMContentLoaded', function() {
    // 选中所有带有 'editable' 或 'editable-text' 类的元素
    const allEditableElements = document.querySelectorAll('.editable, .editable-text');
    
    allEditableElements.forEach(el => {
        // 设置为可编辑
        el.setAttribute('contenteditable', 'true');
        
        // 为每个元素生成一个唯一标识（优先用ID，没有则用内容开头）
        const storageKey = el.id || 'editable_' + el.textContent.substring(0, 10).replace(/\s+/g, '_');
        
        // 加载已保存的文字
        const savedText = localStorage.getItem(storageKey);
        if (savedText) {
            el.innerHTML = savedText;
        }
        
        // 当编辑完成（失去焦点）时保存
        el.addEventListener('blur', function() {
            localStorage.setItem(storageKey, this.innerHTML);
            console.log('已保存文字:', storageKey, this.innerHTML); // 调试用
        });
    });
    
    console.log(`已启用 ${allEditableElements.length} 处文字编辑`); // 调试用

    // 将下雪函数设为全局，以便按钮调用
    window.startSnowfall = startSnowfall;
    window.stopSnowfall = stopSnowfall;
});
