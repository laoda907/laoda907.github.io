// 1. 晃动手机触发下雪效果 (基于[citation:7]思路简化)
let snowInterval;
// 检测手机晃动
window.addEventListener('deviceorientation', function(e) {
    // 简单的晃动判断：当手机倾斜角度变化较大时
    if (Math.abs(e.gamma) > 30 || Math.abs(e.beta) > 30) {
        startSnowfall();
        // 5秒后自动停止下雪
        setTimeout(stopSnowfall, 5000);
    }
});

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
    if (snowInterval) return; // 防止重复启动
    // 先创建一批雪花
    for (let i = 0; i < 30; i++) {
        setTimeout(createSnowflake, i * 100);
    }
    // 持续生成新雪花
    snowInterval = setInterval(createSnowflake, 200);
}

function stopSnowfall() {
    clearInterval(snowInterval);
    snowInterval = null;
}

// 2. 使主界面的文字可编辑
function makeEditable(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.setAttribute('contenteditable', 'true');
        // 点击其他地方保存修改
        element.addEventListener('blur', function() {
            localStorage.setItem(elementId, this.innerHTML);
        });
        // 加载已保存的文字
        const savedText = localStorage.getItem(elementId);
        if (savedText) {
            element.innerHTML = savedText;
        }
    }
}

// 页面加载后运行
document.addEventListener('DOMContentLoaded', function() {
    // 使所有带有 'editable' 类的文字可编辑
    document.querySelectorAll('.editable').forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.addEventListener('blur', function() {
            localStorage.setItem(this.id, this.innerHTML);
        });
        const saved = localStorage.getItem(this.id);
        if (saved) el.innerHTML = saved;
    });
});
