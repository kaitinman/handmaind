// ================================
// 🌼 ハンドメイドECサイト専用 script.js（完全オリジナル）
// ================================
// 20〜40代女性向け “韓国×北欧くすみカラー” ショップ仕様
// ・おしゃれな商品データ
// ・お気に入り
// ・検索
// ・カテゴリフィルター
// ・ローカルストレージ保存
// ・アニメーション

//----------------------------------
// 商品データ
//----------------------------------
const products = [
  {
    id: 1,
    name: "くすみピンクのレジンピアス",
    price: 1800,
    category: "アクセサリー",
    image: "assets/pink.jpg",
    desc: "透明感のあるレジンにゴールドフレークを閉じ込めた淡色ピアス。"
  },
  {
    id: 2,
    name: "ドライフラワーブーケミニ",
    price: 2200,
    category: "フラワー",
    image: "assets/flower.jpg",
    desc: "部屋に飾るだけで一気におしゃれになるスモーキーカラーの花束。"
  },
  {
    id: 3,
    name: "くすみベージュキャンドル",
    price: 1600,
    category: "キャンドル",
    image: "assets/candle.jpg",
    desc: "インテリアになじむやさしいベージュのアロマキャンドル。"
  },
  {
    id: 4,
    name: "韓国風スマホストラップ",
    price: 1400,
    category: "雑貨",
    image: "assets/strap.jpg",
    desc: "淡色ビーズを使用した今流行りのスマホストラップ。"
  },
];

//----------------------------------
// カート機能
//----------------------------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
  const item = cart.find((p) => p.id === id);
  if (item) {
    item.qty++;
  } else {
    const product = products.find((p) => p.id === id);
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
}

//----------------------------------
// カート表示
//----------------------------------
function renderCart() {
  const cartList = document.getElementById("cart-items");
  const totalPrice = document.getElementById("total-price");

  if (!cartList) return; // ページにない時はスキップ

  cartList.innerHTML = "";

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.name}</strong><br>
      ¥${item.price} × ${item.qty}
      <button class="del" data-id="${item.id}">削除</button>
    `;
    cartList.appendChild(li);
  });

  totalPrice.textContent = `合計：¥${total.toLocaleString()}`;

  document.querySelectorAll(".del").forEach((btn) => {
    btn.addEventListener("click", () => {
      cart = cart.filter((i) => i.id != btn.dataset.id);
      saveCart();
      renderCart();
    });
  });
}

//----------------------------------
// 商品一覧生成
//----------------------------------
function renderProducts(list) {
  const box = document.getElementById("product-list");
  if (!box) return;
  box.innerHTML = "";

  list.forEach((p) => {
    const div = document.createElement("div");
    div.className = "product fadein";

    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>¥${p.price.toLocaleString()}</p>
      <button onclick="addToCart(${p.id})">カートに入れる</button>
    `;
    box.appendChild(div);
  });
}

//----------------------------------
// 検索
//----------------------------------
function searchProducts() {
  const word = document.getElementById("search").value;
  const result = products.filter((p) => p.name.includes(word));
  renderProducts(result);
}

//----------------------------------
// カテゴリフィルター
//----------------------------------
function filterCategory(cat) {
  if (cat === "all") return renderProducts(products);
  const result = products.filter((p) => p.category === cat);
  renderProducts(result);
}

//----------------------------------
// 初期表示
//----------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
  renderCart();
});