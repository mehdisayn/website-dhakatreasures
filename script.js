const PRODUCTS = [
  {
    id: 1,
    name: "Pattern Casual Shirt",
    price: 950,
    image: "photos/Screenshot 2026-04-11 at 12.25.51 AM.png"
  },
  {
    id: 2,
    name: "Classic High-Top Sneakers",
    price: 1599,
    image: "photos/Screenshot 2026-04-11 at 12.27.00 AM.png"
  },
  {
    id: 3,
    name: "Boot cut pants",
    price: 2000,
    image: "photos/Screenshot 2026-04-11 at 12.27.58 AM.png"
  },
  {
    id: 4,
    name: "Light Knit Polo",
    price: 650,
    image: "photos/Screenshot 2026-04-11 at 12.28.57 AM.png"
  }
];

const CART_KEY = "dhakaTreasuresCart";
const USER_KEY = "dhakaTreasuresUser";
const SESSION_KEY = "dhakaTreasuresSession";

function getCart() {
  const savedCart = localStorage.getItem(CART_KEY);
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getSavedUser() {
  const savedUser = localStorage.getItem(USER_KEY);
  return savedUser ? JSON.parse(savedUser) : null;
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getSessionUser() {
  const sessionUser = localStorage.getItem(SESSION_KEY);
  return sessionUser ? JSON.parse(sessionUser) : null;
}

function saveSessionUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSessionUser() {
  localStorage.removeItem(SESSION_KEY);
}

function syncSavedUser(sessionUser) {
  const savedUser = getSavedUser();
  if (!savedUser || savedUser.phone !== sessionUser.phone) {
    return;
  }

  const updatedUser = {
    ...savedUser,
    ...sessionUser,
    password: savedUser.password
  };

  saveUser(updatedUser);
}

function getProductById(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

function updateCartCount() {
  const countElement = document.getElementById("cart-count");
  if (!countElement) {
    return;
  }

  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  countElement.textContent = totalItems;
}

function updateAuthUI() {
  const sessionUser = getSessionUser();
  const greeting = document.getElementById("user-greeting");
  const logoutButton = document.getElementById("logout-button");
  const loggedOutLinks = document.querySelectorAll(".logged-out-only");

  loggedOutLinks.forEach((link) => {
    link.classList.toggle("hidden", Boolean(sessionUser));
  });

  if (greeting) {
    if (sessionUser) {
      greeting.textContent = `Hi, ${sessionUser.name}`;
      greeting.classList.remove("hidden");
    } else {
      greeting.textContent = "";
      greeting.classList.add("hidden");
    }
  }

  if (logoutButton) {
    logoutButton.classList.toggle("hidden", !sessionUser);
    logoutButton.onclick = () => {
      clearSessionUser();
      updateAuthUI();
      if (document.body.dataset.page === "login" || document.body.dataset.page === "signup") {
        window.location.href = "index.html";
      }
    };
  }
}

function addToCart(productId) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert("Product added to cart.");
}

function renderProducts() {
  const productList = document.getElementById("product-list");
  if (!productList) {
    return;
  }

  productList.innerHTML = PRODUCTS.map(
    (product) => `
      <article class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-content">
          <h3>${product.name}</h3>
          <p class="price">৳${product.price}</p>
          <button class="button add-to-cart" data-product-id="${product.id}">Add to Cart</button>
        </div>
      </article>
    `
  ).join("");

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(Number(button.dataset.productId));
    });
  });
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  const checkoutButton = document.getElementById("checkout-button");

  if (!cartItemsContainer || !totalElement || !checkoutButton) {
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-state">
        <p>Your cart is empty.</p>
      </div>
    `;
    totalElement.textContent = "0";
    checkoutButton.classList.add("hidden");
    return;
  }

  let totalPrice = 0;

  cartItemsContainer.innerHTML = cart.map((item) => {
    const product = getProductById(item.id);
    if (!product) {
      return "";
    }

    const itemTotal = product.price * item.quantity;
    totalPrice += itemTotal;

    return `
      <article class="cart-item">
        <div>
          <h3>${product.name}</h3>
          <p>Price: ৳${product.price}</p>
          <p>Quantity: ${item.quantity}</p>
        </div>
        <strong>৳${itemTotal}</strong>
      </article>
    `;
  }).join("");

  totalElement.textContent = totalPrice;
  checkoutButton.classList.remove("hidden");
}

function handleCheckout() {
  const form = document.getElementById("checkout-form");
  const successMessage = document.getElementById("success-message");
  const loginRequiredBox = document.getElementById("checkout-login-required");
  const successDetails = document.getElementById("success-details");

  if (!form || !successMessage || !loginRequiredBox || !successDetails) {
    return;
  }

  const sessionUser = getSessionUser();

  if (!sessionUser) {
    form.classList.add("hidden");
    loginRequiredBox.classList.remove("hidden");
    return;
  }

  const nameInput = document.getElementById("customer-name");
  const phoneInput = document.getElementById("customer-phone");
  const addressInput = document.getElementById("customer-address");

  nameInput.value = sessionUser.name || "";
  phoneInput.value = sessionUser.phone || "";
  addressInput.value = sessionUser.address || "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const updatedSessionUser = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim()
    };

    saveSessionUser(updatedSessionUser);
    syncSavedUser(updatedSessionUser);

    localStorage.removeItem(CART_KEY);
    form.classList.add("hidden");
    successMessage.classList.remove("hidden");
    successDetails.textContent = `Payment Successful . Order for ${updatedSessionUser.name}, ${updatedSessionUser.phone}, ${updatedSessionUser.address}.`;
    updateCartCount();
    updateAuthUI();
  });
}

function handleSignup() {
  const form = document.getElementById("signup-form");
  const successMessage = document.getElementById("signup-success");

  if (!form || !successMessage) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const user = {
      name: formData.get("name").trim(),
      phone: formData.get("phone").trim(),
      address: formData.get("address").trim(),
      password: formData.get("password")
    };

    saveUser(user);
    saveSessionUser({ name: user.name, phone: user.phone, address: user.address });
    form.classList.add("hidden");
    successMessage.classList.remove("hidden");
    updateAuthUI();
  });
}

function handleLogin() {
  const form = document.getElementById("login-form");
  const successMessage = document.getElementById("login-success");

  if (!form || !successMessage) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const savedUser = getSavedUser();
    if (!savedUser) {
      alert("No account found. Please sign up first.");
      return;
    }

    const formData = new FormData(form);
    const phone = formData.get("phone").trim();
    const password = formData.get("password");

    if (savedUser.phone !== phone || savedUser.password !== password) {
      alert("Phone or password is incorrect.");
      return;
    }

    saveSessionUser({
      name: savedUser.name,
      phone: savedUser.phone,
      address: savedUser.address || ""
    });
    form.classList.add("hidden");
    successMessage.classList.remove("hidden");
    updateAuthUI();
  });
}

function initPage() {
  updateCartCount();
  updateAuthUI();

  const currentPage = document.body.dataset.page;

  if (currentPage === "home") {
    renderProducts();
  }

  if (currentPage === "cart") {
    renderCart();
  }

  if (currentPage === "checkout") {
    handleCheckout();
  }

  if (currentPage === "signup") {
    handleSignup();
  }

  if (currentPage === "login") {
    handleLogin();
  }
}

document.addEventListener("DOMContentLoaded", initPage);
