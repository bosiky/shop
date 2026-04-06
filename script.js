// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Back to top button
    if (window.scrollY > 600) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    // Update active nav link
    updateActiveNav();
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// ===== ACTIVE NAV LINK =====
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card, .step-card, .testimonial-card, .faq-item, .value-item').forEach(el => {
    observer.observe(el);
});

// ===== CONTACT FORM & FIREBASE COMMENTS =====
const contactForm = document.getElementById('contactForm');
const commentList = document.getElementById('commentList');

// HTML 轉義防止 XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化時間
function formatTime(timestamp) {
    if (!timestamp) return '剛剛';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '剛剛';
    if (diffMin < 60) return `${diffMin} 分鐘前`;
    if (diffHr < 24) return `${diffHr} 小時前`;
    if (diffDay < 7) return `${diffDay} 天前`;
    return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderComments(comments) {
    if (!commentList) return;
    commentList.innerHTML = '';

    if (comments.length === 0) {
        commentList.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">還沒有留言，快來留下第一則留言吧 😊</p>';
        return;
    }

    comments.forEach(thread => {
        let replyHTML = '';
        if (thread.replyMessage) {
            replyHTML = `
                <div style="margin-top: 10px; padding-left: 15px; border-left: 3px solid var(--golden-brown);">
                    <strong>🏕️ 偉泥夫妻 (店家)</strong>
                    <p style="margin-top: 5px; color: var(--text-medium);">${escapeHtml(thread.replyMessage)}</p>
                </div>
            `;
        }

        const timeStr = formatTime(thread.createdAt);

        const html = `
            <div class="comment-item" style="margin-bottom: 15px; background: var(--cream-light); padding: 15px; border-radius: var(--radius-sm);">
                <strong>👩 ${escapeHtml(thread.userName)}</strong> <span style="color: var(--text-light); font-size: 0.8rem;">${timeStr}</span>
                <p style="margin-top: 5px;">${escapeHtml(thread.userMessage)}</p>
                ${replyHTML}
            </div>
        `;
        commentList.insertAdjacentHTML('beforeend', html);
    });
}

// 🔥 Firebase 即時監聽留言 — 所有人都能即時看到新留言
if (typeof db !== 'undefined') {
    db.collection('comments')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            const comments = [];
            snapshot.forEach(doc => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            renderComments(comments);
        }, (error) => {
            console.error('Firebase 讀取留言失敗:', error);
            if (commentList) {
                commentList.innerHTML = '<p style="color: #c0392b; text-align: center; padding: 20px;">⚠️ 留言載入失敗，請檢查 Firebase 設定</p>';
            }
        });
} else {
    console.warn('Firebase 未初始化，留言功能無法使用');
    if (commentList) {
        commentList.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">留言功能載入中...</p>';
    }
}

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const messageInput = document.getElementById('message');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) return;

        // 送出按鈕禁用
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = '送出中...';
        submitBtn.disabled = true;

        try {
            // 新增留言到 Firestore
            const docRef = await db.collection('comments').add({
                userName: name,
                userMessage: message,
                replyMessage: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 清空表單
            contactForm.reset();
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            alert('留言已送出！所有人都看得到你的留言囉 🎉');

            // 自動回覆（1 秒後）
            setTimeout(async () => {
                const replies = [
                    `${name} 您好！收到您的留言囉！我們已經記錄下來，會盡快為您確認處理 🏕️ 祝您有美好的一天！`,
                    `親愛的 ${name}：感謝您的詢問～店長正在為您查詢相關資訊，稍後馬上回覆您喔 🌟`,
                    `哈囉 ${name}！這款商品目前很熱銷，您的問題我們收到囉，小幫手會盡速給您滿意的答覆 ✨`,
                    `${name} 好朋友，謝謝您對我們的支持！您的留言我們已經看到，這就幫您處理 🌿`,
                    `嗨 ${name}，收到您的訊息囉！有任何關於露營好物的問題都可以問我們，等等回覆您喔 ⛺`,
                    `${name} 您好呀！您的問題很有趣呢，偉泥夫妻已經筆記下來，討論後馬上跟您說 📝`,
                    `親愛的 ${name}，感謝留言！每則訊息我們都很重視，請稍待我們一下下，馬上回來 💨`,
                    `哈囉 ${name}！很高興收到您的訊息，您的問題我們馬上就會有專人為您解答囉 🌲`,
                    `${name} 您好！偷偷告訴您，您看上的可是店內的熱門款呢～您的留言我們會趕快處理 🎁`,
                    `謝謝 ${name} 的留言！露營路上有您相伴真好，您的問題我們正火速為您確認中 🚗💨`
                ];
                const randomReply = replies[Math.floor(Math.random() * replies.length)];

                try {
                    await db.collection('comments').doc(docRef.id).update({
                        replyMessage: randomReply
                    });
                } catch (err) {
                    console.error('自動回覆失敗:', err);
                }
            }, 1500);

        } catch (error) {
            console.error('送出留言失敗:', error);
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            alert('留言送出失敗，請檢查網路連線後再試 😢');
        }
    });
}

// ===== FAKE CHECKOUT FLOW =====
const modal = document.getElementById('checkoutModal');
const closeModal = document.getElementById('closeModal');
let currentPrice = 0;

// Open modal on click "我要跟團"
document.querySelectorAll('.btn-order, .promo-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && !href.startsWith('#')) {
            return; // Let it navigate normally
        }
        // Prevent default hash navigation
        e.preventDefault();
        
        const productCard = e.target.closest('.product-card') || e.target.closest('.promo-card');
        if (productCard) {
            // Get product info
            const nameEl = productCard.querySelector('.product-name') || productCard.querySelector('h2');
            const priceEl = productCard.querySelector('.price-sale');
            
            const productName = nameEl ? nameEl.innerText : '精選商品';
            const productPriceStr = priceEl ? priceEl.innerText : '$1000';
            currentPrice = parseInt(productPriceStr.replace(/[^0-9]/g, '')) || 1000;
            
            document.getElementById('checkoutProductName').innerText = productName;
            document.getElementById('checkoutProductPrice').innerText = productPriceStr;
            document.getElementById('checkoutQty').value = 1;
            updateTotal();
            
            // Reset to step 1
            nextStep(1);
            modal.classList.add('show');
        }
    });
});

if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
    });
}

window.updateTotal = function() {
    const qty = parseInt(document.getElementById('checkoutQty').value) || 1;
    const total = currentPrice * qty;
    document.getElementById('checkoutTotal').innerText = '$' + total.toLocaleString();
};

const qtyInput = document.getElementById('checkoutQty');
if (qtyInput) {
    qtyInput.addEventListener('input', window.updateTotal);
}

window.nextStep = function(step) {
    // Basic validation
    if (step === 2) {
        const qty = parseInt(document.getElementById('checkoutQty').value);
        if (qty < 1) { alert('數量請至少填寫 1'); return; }
    }
    if (step === 3) {
        if (!document.getElementById('checkoutName').value || 
            !document.getElementById('checkoutPhone').value ||
            !document.getElementById('checkoutAddress').value) {
            alert('請完整填寫收件資料喔！');
            return;
        }
    }

    // Update steps
    document.querySelectorAll('.step-container').forEach(el => el.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    
    document.querySelectorAll('.checkout-step').forEach((el, index) => {
        if (index < step) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
};

window.togglePayment = function() {
    const method = document.querySelector('input[name="payment"]:checked').value;
    document.getElementById('creditCardArea').style.display = method === 'credit' ? 'block' : 'none';
    document.getElementById('atmArea').style.display = method === 'atm' ? 'block' : 'none';
};

window.processPayment = function() {
    // Fake loading
    const btn = document.querySelector('#step3 .btn-submit:last-child');
    const originalText = btn.innerText;
    btn.innerText = '處理中...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        
        // Generate fake order number
        const rNum = Math.floor(Math.random() * 100000);
        document.getElementById('orderNumber').innerText = 'ORD' + new Date().getTime().toString().slice(-6) + rNum;
        
        window.nextStep(4);
    }, 1500);
};

const finishBtn = document.getElementById('finishOrder');
if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
}

// ===== SMOOTH SCROLL FOR CTA =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== PROGRESS BAR ANIMATION =====
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fill = entry.target.querySelector('.progress-fill');
            if (fill) {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 200);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.product-progress').forEach(el => {
    progressObserver.observe(el);
});

console.log('🏕️ 露營夫妻團購小舖 — 網站載入完成！');
