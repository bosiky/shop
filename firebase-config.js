// =====================================================
// 🔥 Firebase 設定檔
// 
// 請依照以下步驟取得你的 Firebase 設定：
// 1. 前往 https://console.firebase.google.com/
// 2. 建立新專案（或使用現有專案）
// 3. 在專案設定中，新增「網頁應用程式」
// 4. 複製 firebaseConfig 的值貼到下方
// 5. 在 Firestore Database 中建立資料庫（選擇測試模式）
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyAjmv-JUmsCngaXe0cpU26cLzoJQamhR60",
  authDomain: "shop-1f723.firebaseapp.com",
  projectId: "shop-1f723",
  storageBucket: "shop-1f723.firebasestorage.app",
  messagingSenderId: "666055879625",
  appId: "1:666055879625:web:918b163923d5afee161618",
  measurementId: "G-0PKV80QR5G"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log('🔥 Firebase 已初始化');
