// ===== 我的网站特效 - Firebase 实时保存版（带 localStorage 回退） =====
console.log('🔧 脚本加载开始');

// ---------- 1. 下雪功能（保持不变） ----------
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

// ---------- 2. Firebase 初始化（如果你填写了配置） ----------
let useFirestore = false;
let firestoreDB = null;

function initFirebaseIfConfigured() {
    // 已插入你的 firebaseConfig（来自 Firebase 控制台）
    const firebaseConfig = {
      apiKey: "AIzaSyD_KwO_EJxUfAQ3WF98IRN_fua6VXAWTe4",
      authDomain: "laoda907-22511.firebaseapp.com",
      projectId: "laoda907-22511",
      storageBucket: "laoda907-22511.firebasestorage.app",
      messagingSenderId: "176173610464",
      appId: "1:176173610464:web:a7c45c832ad845f1b36785",
      measurementId: "G-5XCSYG4DCW"
    };

    // 如果你没有粘入 config，就跳过 Firebase ���始化，脚本会回退到 localStorage
    if (!firebaseConfig || !firebaseConfig.projectId) {
        console.log('⚠️ 未检测到 Firebase 配置，回退使用 localStorage（仅本地可见）');
        return;
    }

    try {
        // 依赖 firebase compat SDK 已在 HTML 中通过 <script> 引入
        if (typeof firebase === 'undefined') {
            console.error('❌ 未找到 Firebase SDK；请在 HTML 中加入 Firebase SDK 的 <script> 标签');
            return;
        }
        firebase.initializeApp(firebaseConfig);
        firestoreDB = firebase.firestore();
        useFirestore = true;
        console.log('✅ Firebase 已初始化，启用 Firestore 实时同步');
    } catch (err) {
        console.error('❌ 初始化 Firebase 出错:', err);
        useFirestore = false;
    }
}

// ---------- 3. 核心：让所有文字能保存（支持 Firestore 实时 + localStorage 回退） ----------
function fixAllTextSaving() {
    console.log('🔄 开始修复文字保存...');

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

        const storageKey = 'text_' + (index + 1);
        el.dataset.saveKey = storageKey;
        el.setAttribute('contenteditable', 'true');

        // 先从 localStorage 设默认（保证首次展示不会是空）
        const localSaved = localStorage.getItem(storageKey);
        if ((localSaved === null || localSaved === '') && item.default) {
            localStorage.setItem(storageKey, item.default);
        }
        // 如果启用了 Firestore，我们尝试从云端读取并监听实时更新
        if (useFirestore && firestoreDB) {
            const docRef = firestoreDB.collection('editable').doc(storageKey);
            // 首次加载时如果云端为空，则初始化为 localSaved 或默认
            docRef.get().then(snapshot => {
                if (!snapshot.exists) {
                    const initial = localSaved !== null ? localSaved : item.default;
                    docRef.set({ html: initial, updated: Date.now() }).then(() => {
                        console.log(`  📝 Firestore: 已为 ${storageKey} 设置初始值`);
                    }).catch(err => console.error('Firestore set error:', err));
                }
            }).catch(err => console.error('Firestore get error:', err));

            // 实时监听：当云端发生变化时更新页面内容（来自他人或自己）
            docRef.onSnapshot(docSnap => {
                if (docSnap && docSnap.exists) {
                    const data = docSnap.data();
                    if (data && typeof data.html === 'string') {
                        // 只有在页面内容与云端不同的时候才覆盖，避免无限回环
                        if (el.innerHTML !== data.html) {
                            el.innerHTML = data.html;
                            console.log(`  🔔 来自 Firestore 的更新：${storageKey}`);
                        }
                        fixedCount++;
                    }
                }
            }, err => console.error('onSnapshot error:', err));
        } else {
            // 未启用 Firestore：直接从 localStorage 加载
            const saved = localStorage.getItem(storageKey);
            if (saved !== null && saved !== '') {
                el.innerHTML = saved;
                fixedCount++;
            } else {
                el.innerHTML = item.default;
                localStorage.setItem(storageKey, item.default);
            }
        }

        // 输入时保存（节流）
        let saveTimer;
        el.addEventListener('input', function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const value = this.innerHTML;
                localStorage.setItem(storageKey, value); // 本地备份
                if (useFirestore && firestoreDB) {
                    firestoreDB.collection('editable').doc(storageKey).set({
                        html: value,
                        updated: Date.now()
                    }).then(() => {
                        console.log(`  💾 Firestore 保存成功: ${storageKey}`);
                    }).catch(err => {
                        console.error('Firestore 保存失败:', err);
                    });
                } else {
                    console.log(`  💾 localStorage 保存: ${storageKey}`);
                }
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

    console.log(`✅ 保存功能已初始化（若启用 Firestore 则为实时同步）`);
    return fixedCount;
}

// ---------- 4. 页面加载初始化 ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 页面加载完成');

    // 尝试初始化 Firebase（需要你粘入 config）
    initFirebaseIfConfigured();

    const fixed = fixAllTextSaving();
    if (fixed === 0) {
        console.log('ℹ️ 初次运行或尚无已保存内容（页面已设置默认值）');
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
                if (content) result += `  内容: "${content.substring(0, 40)}..."\n`;
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
    console.log('📊 本地已保存项目数:', Object.keys(localStorage).length);
    if (!useFirestore) console.log('🔔 Firestore 未启用：站点当前仅使用 localStorage（仅本地可见）');
}, 2000);
