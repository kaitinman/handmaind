// ====== サンプルデータ（商品・クーポン） ======
const PRODUCTS = [
  { id: "p1", name: { ja:"レジンフラワーピアス", en:"Resin Flower Earrings" }, price:2800, img:"images/sample1.jpg", desc:{ ja:"透明感のあるレジンに花を閉じ込めた手作りピアス。", en:"Handmade resin earrings with real flowers." }, created: "2025-09-01" },
  { id: "p2", name: { ja:"天然木コースター", en:"Natural Wood Coaster" }, price:1200, img:"images/sample2.jpg", desc:{ ja:"木の風合いを生かしたコースター。", en:"Coaster made from natural wood." }, created: "2025-10-10" },
  { id: "p3", name: { ja:"ドライフラワーリース", en:"Dried Flower Wreath" }, price:3500, img:"images/sample3.jpg", desc:{ ja:"季節のドライフラワーで作ったリース。", en:"Wreath made of seasonal dried flowers." }, created: "2025-11-05" }
];

const COUPONS = [
  { code: "WELCOME10", type:"percent", value:10, desc:"新規登録者向け10%OFF" },
  { code: "FALL500", type:"fixed", value:500, desc:"500円引き" }
];

// ====== ローカルストレージキー ======
const LS_CART = "hs_cart_v1";
const LS_USERS = "hs_users_v1";
const LS_SESSION = "hs_session_v1";
const LS_ORDERS = "hs_orders_v1";
const LS_REVIEWS = "hs_reviews_v1";
const LS_COUPON = "hs_coupon_v1";

// ====== UI要素取得 ======
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search");
const cartBtn = document.getElementById("cart-btn");
const cartPanel = document.getElementById("cart-panel");
const cartList = document.getElementById("cart-list");
const cartCount = document.getElementById("cart-count");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const applyCouponBtn = document.getElementById("apply-coupon");
const couponInput = document.getElementById("coupon-input");
const couponMsg = document.getElementById("coupon-msg");
const loginBtn = document.getElementById("login-btn");
const authModal = document.getElementById("auth-modal");
const authClose = document.getElementById("auth-close");
const authLogin = document.getElementById("auth-login");
const authSignup = document.getElementById("auth-signup");
const authEmail = document.getElementById("auth-email");
const authPass = document.getElementById("auth-pass");
const authMsg = document.getElementById("auth-msg");
const accountBtn = document.getElementById("account-btn");
const accountPage = document.getElementById("account-page");
const accountEmail = document.getElementById("account-email");
const accountCreated = document.getElementById("account-created");
const logoutBtn = document.getElementById("logout-btn");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalDesc = document.getElementById("modal-desc");
const modalQty = document.getElementById("modal-qty");
const addCartBtn = document.getElementById("add-cart-btn");
const reviewList = document.getElementById("review-list");
const reviewName = document.getElementById("review-name");
const reviewText = document.getElementById("review-text");
const postReviewBtn = document.getElementById("post-review");
const shareBtn = document.getElementById("share-btn");
const langSelect = document.getElementById("lang-select");
const themeSelect = document.getElementById("theme-select");
const sortSelect = document.getElementById("sort");
const clickSnd = document.getElementById("click-snd");
const successSnd = document.getElementById("success-snd");

// ====== 初期化 ======
let cart = loadJSON(LS_CART) || [];
let session = loadJSON(LS_SESSION) || null;
let appliedCoupon = loadJSON(LS_COUPON) || null;
let currentProduct = null;
let reviews = loadJSON(LS_REVIEWS) || {};
let orders = loadJSON(LS_ORDERS) || [];

// 初期レンダリング
renderProducts(PRODUCTS);
renderCart();
updateAuthUI();
applyThemeFromSelect();
setLanguageFromSelect();

// ====== ユーティリティ ======
function loadJSON(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } }
function saveJSON(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function playClick(){ try{ clickSnd.play(); }catch(e){} }
function playSuccess(){ try{ successSnd.play(); }catch(e){} }

// ====== 商品レンダリング ======
function renderProducts(list){
  productGrid.innerHTML = "";
  list.forEach(p=>{
    const el = document.createElement("div");
    el.className = "card";
    el.dataset.id = p.id;
    el.innerHTML = `
      <img src="${p.img}" alt="${getLangText(p.name)}">
      <h3>${getLangText(p.name)}</h3>
      <p class="price">¥${p.price}</p>
    `;
    el.addEventListener("click", ()=> openProduct(p.id));
    productGrid.appendChild(el);
  });
}

// 言語用テキスト取得
function getLangText(obj){
  const lang = langSelect.value || "ja";
  return (typeof obj === "string") ? obj : (obj[lang] || obj["ja"]);
}

// ====== モーダル（商品詳細） ======
function openProduct(id){
  playClick();
  currentProduct = PRODUCTS.find(x=>x.id===id);
  if(!currentProduct) return;
  modalImg.src = currentProduct.img;
  modalTitle.textContent = getLangText(currentProduct.name);
  modalPrice.textContent = "¥" + currentProduct.price;
  modalDesc.textContent = getLangText(currentProduct.desc);
  modalQty.value = 1;
  renderReviewsForProduct(id);
  modal.classList.remove("hidden");
}
modalClose.addEventListener("click", ()=> modal.classList.add("hidden"));

// レビュー表示
function renderReviewsForProduct(pid){
  reviewList.innerHTML = "";
  const list = reviews[pid] || [];
  if(list.length===0){
    reviewList.innerHTML = "<li class='muted'>レビューはまだありません</li>";
    return;
  }
  list.forEach(r=>{
    const li = document.createElement("li");
    li.innerHTML = `<strong>${escapeHtml(r.name)}</strong> <span class="muted">(${r.date})</span><div>${escapeHtml(r.text)}</div>`;
    reviewList.appendChild(li);
  });
}
function escapeHtml(s){ return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

// 投稿
postReviewBtn.addEventListener("click", ()=>{
  const name = reviewName.value.trim() || "匿名";
  const text = reviewText.value.trim();
  if(!text) return alert("レビューを入力してください");
  const pid = currentProduct.id;
  reviews[pid] = reviews[pid] || [];
  reviews[pid].push({ name, text, date: new Date().toLocaleString() });
  saveJSON(LS_REVIEWS, reviews);
  reviewName.value = "";
  reviewText.value = "";
  renderReviewsForProduct(pid);
  playSuccess();
});

// 共有ボタン
shareBtn.addEventListener("click", async ()=>{
  const title = getLangText(currentProduct.name);
  const text = `${title} - ${getLangText(currentProduct.desc)} ¥${currentProduct.price}`;
  if(navigator.share){
    try{ await navigator.share({ title, text }); }catch(e){}
  }else{
    prompt("商品テキスト（コピー）", text);
  }
});

// ====== カート機能 ======
function addToCart(product, qty=1){
  playClick();
  const existing = cart.find(c=>c.id===product.id);
  if(existing){ existing.qty += parseInt(qty); }
  else{ cart.push({ id: product.id, qty: parseInt(qty) }); }
  saveJSON(LS_CART, cart);
  renderCart();
  modal.classList.add("hidden");
}

addCartBtn.addEventListener("click", ()=>{
  if(!currentProduct) return;
  const qty = parseInt(modalQty.value) || 1;
  addToCart(currentProduct, qty);
  playSuccess();
});

// カート表示
cartBtn.addEventListener("click", ()=> cartPanel.classList.toggle("hidden"));
document.getElementById("close-cart").addEventListener("click", ()=> cartPanel.classList.add("hidden"));

function renderCart(){
  cartList.innerHTML = "";
  let subtotal = 0;
  cart.forEach((c, idx)=>{
    const p = PRODUCTS.find(x=>x.id===c.id);
    if(!p) return;
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${getLangText(p.name)}</strong><div class="muted">¥${p.price}</div>
      </div>
      <div>
        <input type="number" min="1" value="${c.qty}" data-idx="${idx}" class="cart-qty" />
        <div>¥${p.price * c.qty}</div>
        <button data-idx="${idx}" class="btn small remove">削除</button>
      </div>
    `;
    cartList.appendChild(li);
    subtotal += p.price * c.qty;
  });
  subtotalEl.textContent = subtotal;
  let discount = 0;
  if(appliedCoupon){
    if(appliedCoupon.type==="percent") discount = Math.floor(subtotal * appliedCoupon.value / 100);
    else discount = appliedCoupon.value;
    discountEl.textContent = discount;
  } else { discountEl.textContent = 0; }
  totalEl.textContent = subtotal - discount;
  cartCount.textContent = cart.reduce((s,c)=>s+c.qty,0);

  // イベントバインド（数量・削除）
  document.querySelectorAll(".cart-qty").forEach(inp=>{
    inp.addEventListener("change", (e)=>{
      const idx = e.target.dataset.idx;
      const v = parseInt(e.target.value) || 1;
      cart[idx].qty = v;
      saveJSON(LS_CART, cart);
      renderCart();
    });
  });
  document.querySelectorAll(".remove").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      const idx = e.target.dataset.idx;
      cart.splice(idx,1);
      saveJSON(LS_CART, cart);
      renderCart();
      playClick();
    });
  });
}

// クーポン適用
applyCouponBtn.addEventListener("click", ()=>{
  const code = (couponInput.value||"").trim().toUpperCase();
  const found = COUPONS.find(c=>c.code===code);
  if(!found){ couponMsg.textContent = "無効なクーポンです"; appliedCoupon = null; saveJSON(LS_COUPON,null); renderCart(); return; }
  appliedCoupon = found;
  saveJSON(LS_COUPON, appliedCoupon);
  couponMsg.textContent = `適用: ${found.desc || found.code}`;
  renderCart();
});

// ====== 検索＆ソート ======
searchInput.addEventListener("input", ()=> {
  applyProductFilter();
});
sortSelect.addEventListener("change", ()=> applyProductFilter());

function applyProductFilter(){
  const kw = (searchInput.value||"").toLowerCase();
  let list = PRODUCTS.filter(p => getLangText(p.name).toLowerCase().includes(kw) || getLangText(p.desc).toLowerCase().includes(kw));
  const sort = sortSelect.value;
  if(sort==="price-asc") list.sort((a,b)=>a.price-b.price);
  if(sort==="price-desc") list.sort((a,b)=>b.price-a.price);
  if(sort==="new") list.sort((a,b)=> new Date(b.created) - new Date(a.created));
  renderProducts(list);
}

// ====== 認証（簡易） ======
loginBtn.addEventListener("click", ()=> { authModal.classList.remove("hidden"); authMsg.textContent = ""; document.getElementById("auth-title").textContent = "ログイン"; });
authClose.addEventListener("click", ()=> authModal.classList.add("hidden"));
authSignup.addEventListener("click", ()=> signup());
authLogin.addEventListener("click", ()=> login());

function signup(){
  const email = (authEmail.value||"").trim();
  const pass = (authPass.value||"").trim();
  if(!email || !pass) { authMsg.textContent = "メールとパスワードを入力してください"; return; }
  let users = loadJSON(LS_USERS) || {};
  if(users[email]) { authMsg.textContent = "既に登録済みです。ログインしてください"; return; }
  users[email] = { pass, created: new Date().toLocaleString() };
  saveJSON(LS_USERS, users);
  authMsg.textContent = "登録完了しました。ログインしてください。";
}

function login(){
  const email = (authEmail.value||"").trim();
  const pass = (authPass.value||"").trim();
  if(!email || !pass) { authMsg.textContent = "入力してください"; return; }
  let users = loadJSON(LS_USERS) || {};
  const u = users[email];
  if(!u || u.pass !== pass) { authMsg.textContent = "メールまたはパスワードが違います"; return; }
  session = { email, loggedAt: new Date().toLocaleString() };
  saveJSON(LS_SESSION, session);
  authModal.classList.add("hidden");
  authEmail.value = ""; authPass.value = "";
  updateAuthUI();
  playSuccess();
}

function updateAuthUI(){
  if(session && session.email){
    loginBtn.classList.add("hidden");
    accountBtn.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    accountBtn.classList.add("hidden");
  }
}

accountBtn.addEventListener("click", ()=> {
  showAccountPage();
});

logoutBtn.addEventListener("click", ()=> {
  session = null; localStorage.removeItem(LS_SESSION);
  updateAuthUI();
  accountPage.classList.add("hidden");
});

// ====== アカウントページ ======
function showAccountPage(){
  if(!session){ alert("ログインしてください"); authModal.classList.remove("hidden"); return; }
  const users = loadJSON(LS_USERS) || {};
  const u = users[session.email];
  accountEmail.textContent = session.email;
  accountCreated.textContent = u.created || "-";
  renderOrdersForUser(session.email);
  accountPage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 注文履歴表示
function renderOrdersForUser(email){
  const all = loadJSON(LS_ORDERS) || [];
  const my = all.filter(o => o.email === email);
  const ul = document.getElementById("order-history");
  ul.innerHTML = "";
  if(my.length===0){ ul.innerHTML = "<li class='muted'>注文履歴はありません</li>"; return; }
  my.forEach(o=>{
    const li = document.createElement("li");
    li.innerHTML = `<strong>注文 ${o.id}</strong> 合計: ¥${o.total} <div class="muted">${o.date}</div>`;
    ul.appendChild(li);
  });
}

// ====== チェックアウト（擬似） ======
document.getElementById("checkout-btn").addEventListener("click", ()=> {
  if(cart.length===0) { alert("カートが空です"); return; }
  if(!session){ if(!confirm("ログインして購入しますか？（OK=ログイン画面へ）")) return; authModal.classList.remove("hidden"); return; }
  document.getElementById("checkout-modal").classList.remove("hidden");
});
document.getElementById("checkout-close").addEventListener("click", ()=> document.getElementById("checkout-modal").classList.add("hidden"));

document.getElementById("to-payment").addEventListener("click", ()=> {
  document.getElementById("step-info").classList.add("hidden");
  document.getElementById("step-payment").classList.remove("hidden");
});
document.getElementById("pay-btn").addEventListener("click", ()=> {
  // シンプルなバリデーション
  const name = document.getElementById("card-name").value.trim();
  const num = document.getElementById("card-num").value.replaceAll(" ","").trim();
  if(num.length < 12) { alert("カード番号を確認してください"); return; }
  // 注文作成
  const subtotal = parseInt(subtotalEl.textContent) || 0;
  const discount = parseInt(discountEl.textContent) || 0;
  const total = subtotal - discount;
  const orderId = "ORD" + Date.now();
  const order = {
    id: orderId,
    email: session.email,
    items: cart.slice(),
    total,
    shipping: { name: document.getElementById("ship-name").value, address: document.getElementById("ship-address").value },
    date: new Date().toLocaleString()
  };
  orders.push(order);
  saveJSON(LS_ORDERS, orders);
  // カートクリア
  cart = [];
  saveJSON(LS_CART, cart);
  appliedCoupon = null;
  saveJSON(LS_COUPON, null);
  renderCart();
  // 完了表示
  document.getElementById("step-payment").classList.add("hidden");
  document.getElementById("step-done").classList.remove("hidden");
  document.getElementById("order-id").textContent = orderId;
  playSuccess();
  // 更新のため会員ページを確認可能に
});

// 完了閉じる
document.getElementById("done-close").addEventListener("click", ()=>{
  document.getElementById("checkout-modal").classList.add("hidden");
  document.getElementById("step-info").classList.remove("hidden");
  document.getElementById("step-done").classList.add("hidden");
  if(session) showAccountPage();
});

// ====== 言語・テーマ切替 ======
langSelect.addEventListener("change", ()=> {
  applyLanguage();
});
themeSelect.addEventListener("change", ()=> {
  applyThemeFromSelect();
});

function applyLanguage(){
  // 簡易：ページ内固定文字列を切替
  const lang = langSelect.value || "ja";
  if(lang==="ja"){
    document.getElementById("hero-title").textContent = "暮らしを彩るハンドメイド作品";
    document.getElementById("hero-sub").textContent = "アクセサリー・雑貨・インテリアを厳選してお届け";
    document.getElementById("products-title").textContent = "商品一覧";
    document.getElementById("cart-title").textContent = "カート";
    document.getElementById("checkout-title").textContent = "購入手続き";
    document.getElementById("auth-title").textContent = "ログイン";
    document.getElementById("login-btn").textContent = "ログイン";
    document.getElementById("account-btn").textContent = "マイページ";
    document.getElementById("checkout-btn").textContent = "購入手続きへ";
  } else {
    document.getElementById("hero-title").textContent = "Handmade goods to brighten your life";
    document.getElementById("hero-sub").textContent = "Accessories, home goods, and curated crafts";
    document.getElementById("products-title").textContent = "Products";
    document.getElementById("cart-title").textContent = "Cart";
    document.getElementById("checkout-title").textContent = "Checkout";
    document.getElementById("auth-title").textContent = "Login";
    document.getElementById("login-btn").textContent = "Login";
    document.getElementById("account-btn").textContent = "Account";
    document.getElementById("checkout-btn").textContent = "Proceed to Checkout";
  }
  // 再描画
  applyProductFilter();
}

function applyThemeFromSelect(){
  const t = themeSelect.value;
  if(t==="dark"){
    document.documentElement.style.setProperty("--bg","#121212");
    document.documentElement.style.setProperty("--text","#ddd");
    document.documentElement.style.setProperty("--card","#1e1e1e");
    document.documentElement.style.setProperty("--brand","#9b7b5a");
  } else if(t==="light"){
    document.documentElement.style.setProperty("--bg","#ffffff");
    document.documentElement.style.setProperty("--text","#333");
    document.documentElement.style.setProperty("--card","#ffffff");
    document.documentElement.style.setProperty("--brand","#6a4e3a");
  } else { // natural
    document.documentElement.style.setProperty("--bg","#fbf7f2");
    document.documentElement.style.setProperty("--text","#333");
    document.documentElement.style.setProperty("--card","#ffffff");
    document.documentElement.style.setProperty("--brand","#6a4e3a");
  }
}

// 初期言語/テーマ
function setLanguageFromSelect(){ langSelect.value = "ja"; applyLanguage(); }
function applyThemeFromSelect(){ themeSelect.value = themeSelect.value || "natural"; applyThemeFromSelect(); }

// ====== 小さなユーティリティ ======
document.addEventListener("click", (e)=> {
  if(!cartPanel.contains(e.target) && !cartBtn.contains(e.target)) {
    // クリック外で閉じたいときはコメント解除
    // cartPanel.classList.add("hidden");
  }
});

// ショートカット：プロダクトを2秒で追加するAPI（開発用）
window.__dev_add = function(id){ const p = PRODUCTS.find(x=>x.id===id); if(p) addToCart(p,1); };

// 初期総計表示
renderCart();
