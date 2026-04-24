(function () {
  const STORAGE_KEY = "ecommerce-frontend-state";
  const DEFAULT_BASE_URL = "http://localhost:3000/api";

  const state = {
    baseUrl: DEFAULT_BASE_URL,
    token: "",
    customer: null,
    selectedCustomerId: "",
    selectedProductId: "",
    selectedOrderId: "",
    selectedPaymentId: "",
    latestResponse: null,
    activity: []
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindElements();
    restoreState();
    bindEvents();
    renderSession();
    renderSelections();
    renderActivity();
    renderResponse("Latest response payload will appear here.");
    renderEmptyStates();
  }

  function bindElements() {
    [
      "gateway-url-label",
      "session-role",
      "selected-customer-label",
      "health-output",
      "session-output",
      "product-output",
      "customer-output",
      "order-output",
      "payment-output",
      "response-viewer",
      "activity-log",
      "product-list",
      "customer-list",
      "cart-summary",
      "order-list",
      "payment-list",
      "customer-selection-summary"
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });

    [
      "config-form",
      "register-form",
      "login-form",
      "change-password-form",
      "reset-password-form",
      "product-filter-form",
      "product-detail-form",
      "product-create-form",
      "inventory-form",
      "profile-update-form",
      "customer-search-form",
      "customer-status-form",
      "cart-add-form",
      "cart-update-form",
      "checkout-form",
      "orders-filter-form",
      "order-detail-form",
      "order-status-form",
      "payment-create-form",
      "payments-filter-form",
      "payment-detail-form",
      "refund-form",
      "payment-status-form"
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });

    [
      "api-base-url",
      "health-check-btn",
      "reset-config-btn",
      "admin-fill-btn",
      "customer-fill-btn",
      "logout-btn",
      "load-products-btn",
      "clear-product-selection-btn",
      "delete-product-btn",
      "load-profile-btn",
      "delete-customer-btn",
      "load-cart-btn",
      "remove-cart-item-btn",
      "clear-cart-btn",
      "cancel-order-btn",
      "load-payments-btn",
      "receipt-btn",
      "clear-log-btn"
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    els["config-form"].addEventListener("submit", onSaveConfig);
    els["health-check-btn"].addEventListener("click", runHealthCheck);
    els["reset-config-btn"].addEventListener("click", resetConfig);

    els["register-form"].addEventListener("submit", onRegister);
    els["login-form"].addEventListener("submit", onLogin);
    els["change-password-form"].addEventListener("submit", onChangePassword);
    els["reset-password-form"].addEventListener("submit", onResetPassword);
    els["logout-btn"].addEventListener("click", onLogout);
    els["admin-fill-btn"].addEventListener("click", () => fillLogin("admin@example.com", "Admin@123"));
    els["customer-fill-btn"].addEventListener("click", () => fillLogin("jane@example.com", "Customer@123"));

    els["product-filter-form"].addEventListener("submit", onLoadProducts);
    els["load-products-btn"].addEventListener("click", onLoadProducts);
    els["product-detail-form"].addEventListener("submit", onLoadProductDetail);
    els["product-create-form"].addEventListener("submit", onSaveProduct);
    els["inventory-form"].addEventListener("submit", onUpdateInventory);
    els["clear-product-selection-btn"].addEventListener("click", clearProductSelection);
    els["delete-product-btn"].addEventListener("click", onDeleteProduct);

    els["load-profile-btn"].addEventListener("click", onLoadProfile);
    els["profile-update-form"].addEventListener("submit", onUpdateCustomer);
    els["customer-search-form"].addEventListener("submit", onLoadCustomers);
    els["customer-status-form"].addEventListener("submit", onUpdateCustomerStatus);
    els["delete-customer-btn"].addEventListener("click", onDeleteCustomer);

    els["cart-add-form"].addEventListener("submit", onAddCartItem);
    els["cart-update-form"].addEventListener("submit", onUpdateCartItem);
    els["checkout-form"].addEventListener("submit", onCreateOrder);
    els["orders-filter-form"].addEventListener("submit", onLoadOrders);
    els["order-detail-form"].addEventListener("submit", onLoadOrderDetail);
    els["order-status-form"].addEventListener("submit", onUpdateOrderStatus);
    els["load-cart-btn"].addEventListener("click", onLoadCart);
    els["remove-cart-item-btn"].addEventListener("click", onRemoveCartItem);
    els["clear-cart-btn"].addEventListener("click", onClearCart);
    els["cancel-order-btn"].addEventListener("click", onCancelOrder);

    els["payment-create-form"].addEventListener("submit", onCreatePayment);
    els["payments-filter-form"].addEventListener("submit", onLoadPayments);
    els["payment-detail-form"].addEventListener("submit", onLoadPaymentDetail);
    els["refund-form"].addEventListener("submit", onRefundPayment);
    els["payment-status-form"].addEventListener("submit", onUpdatePaymentStatus);
    els["load-payments-btn"].addEventListener("click", onLoadPayments);
    els["receipt-btn"].addEventListener("click", onGetReceipt);

    els["clear-log-btn"].addEventListener("click", () => {
      state.activity = [];
      persistState();
      renderActivity();
      pushNotice("Activity log cleared.");
    });
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      Object.assign(state, saved);
    } catch (error) {
      console.warn("Could not restore state", error);
    }

    els["api-base-url"].value = state.baseUrl || DEFAULT_BASE_URL;
    els["gateway-url-label"].textContent = state.baseUrl;
  }

  function persistState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        baseUrl: state.baseUrl,
        token: state.token,
        customer: state.customer,
        selectedCustomerId: state.selectedCustomerId,
        selectedProductId: state.selectedProductId,
        selectedOrderId: state.selectedOrderId,
        selectedPaymentId: state.selectedPaymentId,
        latestResponse: state.latestResponse,
        activity: state.activity.slice(0, 30)
      })
    );
  }

  async function onSaveConfig(event) {
    event.preventDefault();
    const baseUrl = new FormData(event.currentTarget).get("baseUrl").trim();
    state.baseUrl = baseUrl || DEFAULT_BASE_URL;
    els["gateway-url-label"].textContent = state.baseUrl;
    persistState();
    pushNotice(`Gateway URL set to ${state.baseUrl}`);
  }

  function resetConfig() {
    state.baseUrl = DEFAULT_BASE_URL;
    els["api-base-url"].value = DEFAULT_BASE_URL;
    els["gateway-url-label"].textContent = DEFAULT_BASE_URL;
    persistState();
    pushNotice("Gateway URL reset to default.");
  }

  async function runHealthCheck() {
    const services = [
      { label: "Gateway", url: state.baseUrl.replace(/\/api$/, "") + "/health" },
      { label: "Product Service", url: "http://localhost:3001/health" },
      { label: "Customer Service", url: "http://localhost:3002/health" },
      { label: "Order Service", url: "http://localhost:3003/health" },
      { label: "Payment Service", url: "http://localhost:3004/health" }
    ];

    const results = [];
    for (const service of services) {
      try {
        const response = await fetch(service.url);
        const data = await response.json();
        results.push({ service: service.label, ok: response.ok, data });
      } catch (error) {
        results.push({ service: service.label, ok: false, error: error.message });
      }
    }

    els["health-output"].textContent = JSON.stringify(results, null, 2);
    renderResponse(results);
    pushActivity("Health check", "Environment", results);
  }

  async function onRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      email: formData.get("email").trim(),
      password: formData.get("password"),
      phone: formData.get("phone").trim(),
      addresses: parseJsonField(formData.get("addresses"), "addresses")
    };

    const data = await request("/auth/register", {
      method: "POST",
      body: payload
    });

    setSession(data);
    renderToBox("session-output", data);
    event.currentTarget.reset();
  }

  async function onLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = await request("/auth/login", {
      method: "POST",
      body: {
        email: formData.get("email").trim(),
        password: formData.get("password")
      }
    });
    setSession(data);
    renderToBox("session-output", data);
  }

  async function onChangePassword(event) {
    event.preventDefault();
    requireAuth();
    const formData = new FormData(event.currentTarget);
    const data = await request("/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword")
      }
    });
    renderToBox("session-output", data);
    event.currentTarget.reset();
  }

  async function onResetPassword(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = await request("/auth/reset-password", {
      method: "POST",
      body: {
        email: formData.get("email").trim(),
        newPassword: formData.get("newPassword")
      }
    });
    renderToBox("session-output", data);
  }

  function onLogout() {
    state.token = "";
    state.customer = null;
    state.selectedCustomerId = "";
    persistState();
    renderSession();
    renderSelections();
    renderToBox("session-output", "No active session.");
    pushNotice("Logged out.");
  }

  function fillLogin(email, password) {
    const form = els["login-form"];
    form.elements.email.value = email;
    form.elements.password.value = password;
  }

  async function onLoadProducts(event) {
    if (event) {
      event.preventDefault();
    }
    const formData = new FormData(els["product-filter-form"]);
    const params = buildParams({
      category: formData.get("category"),
      keyword: formData.get("keyword"),
      minPrice: formData.get("minPrice"),
      maxPrice: formData.get("maxPrice"),
      inStock: formData.get("inStock")
    });
    const data = await request(`/products${params}`);
    renderProducts(data.items || []);
    renderToBox("product-output", data);
  }

  async function onLoadProductDetail(event) {
    event.preventDefault();
    const productId = new FormData(event.currentTarget).get("productId").trim();
    if (!productId) {
      throw new Error("Product ID is required");
    }
    const data = await request(`/products/${productId}`);
    selectProduct(productId, data);
    renderToBox("product-output", data);
  }

  async function onSaveProduct(event) {
    event.preventDefault();
    requireAdmin();
    const formData = new FormData(event.currentTarget);
    const productId = formData.get("id").trim();
    const payload = {
      name: formData.get("name").trim(),
      description: formData.get("description").trim(),
      category: formData.get("category").trim(),
      price: Number(formData.get("price")),
      currency: formData.get("currency").trim() || "USD",
      sku: formData.get("sku").trim(),
      inventory: Number(formData.get("inventory") || 0),
      tags: String(formData.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    };

    const data = await request(productId ? `/products/${productId}` : "/products", {
      method: productId ? "PUT" : "POST",
      body: payload
    });

    selectProduct(data.id, data);
    renderToBox("product-output", data);
    await onLoadProducts();
  }

  async function onDeleteProduct() {
    requireAdmin();
    const productId =
      els["product-create-form"].elements.id.value.trim() ||
      els["product-detail-form"].elements.productId.value.trim() ||
      state.selectedProductId;
    if (!productId) {
      throw new Error("Select or enter a product ID to delete");
    }

    const data = await request(`/products/${productId}`, { method: "DELETE" });
    clearProductSelection();
    renderToBox("product-output", data);
    await onLoadProducts();
  }

  async function onUpdateInventory(event) {
    event.preventDefault();
    requireAdmin();
    const formData = new FormData(event.currentTarget);
    const productId = formData.get("productId").trim();
    const data = await request(`/products/${productId}/inventory`, {
      method: "PATCH",
      body: {
        quantity: Number(formData.get("quantity")),
        operation: formData.get("operation")
      }
    });
    selectProduct(productId, data);
    renderToBox("product-output", data);
    await onLoadProducts();
  }

  function clearProductSelection() {
    state.selectedProductId = "";
    els["product-detail-form"].reset();
    els["product-create-form"].elements.id.value = "";
    els["inventory-form"].elements.productId.value = "";
    persistState();
    renderSelections();
  }

  async function onLoadProfile() {
    requireAuth();
    const data = await request("/customers/me");
    state.selectedCustomerId = data.id;
    persistState();
    renderSelections();
    renderToBox("customer-output", data);
    prefillCustomerForms(data);
  }

  async function onUpdateCustomer(event) {
    event.preventDefault();
    requireAuth();
    const formData = new FormData(event.currentTarget);
    const customerId = resolveCustomerId(formData.get("customerId"));
    const payload = {};

    ["firstName", "lastName", "phone"].forEach((field) => {
      const value = formData.get(field).trim();
      if (value) {
        payload[field] = value;
      }
    });

    const role = formData.get("role");
    if (role) {
      payload.role = role;
    }

    const addressesRaw = formData.get("addresses").trim();
    if (addressesRaw) {
      payload.addresses = parseJsonField(addressesRaw, "addresses");
    }

    const data = await request(`/customers/${customerId}`, {
      method: "PUT",
      body: payload
    });

    if (state.customer && state.customer.id === data.id) {
      state.customer = data;
      persistState();
      renderSession();
    }

    state.selectedCustomerId = data.id;
    persistState();
    renderSelections();
    renderToBox("customer-output", data);
  }

  async function onLoadCustomers(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    requireAdmin();
    const formData = new FormData(els["customer-search-form"]);
    const params = buildParams({
      keyword: formData.get("keyword"),
      status: formData.get("status"),
      role: formData.get("role")
    });
    const data = await request(`/customers${params}`);
    renderCustomers(data.items || []);
    renderToBox("customer-output", data);
  }

  async function onUpdateCustomerStatus(event) {
    event.preventDefault();
    requireAdmin();
    const formData = new FormData(event.currentTarget);
    const customerId = formData.get("customerId").trim();
    const data = await request(`/customers/${customerId}/status`, {
      method: "PATCH",
      body: { status: formData.get("status") }
    });
    state.selectedCustomerId = data.id;
    persistState();
    renderSelections();
    renderToBox("customer-output", data);
    await onLoadCustomers();
  }

  async function onDeleteCustomer() {
    requireAdmin();
    const customerId =
      els["customer-status-form"].elements.customerId.value.trim() || state.selectedCustomerId || resolveCustomerId("");
    if (!customerId) {
      throw new Error("Select or enter a customer ID to delete");
    }
    const data = await request(`/customers/${customerId}`, { method: "DELETE" });
    renderToBox("customer-output", data);
    if (state.selectedCustomerId === customerId) {
      state.selectedCustomerId = "";
      persistState();
      renderSelections();
    }
    await onLoadCustomers();
  }

  async function onLoadCart() {
    requireAuth();
    const customerId =
      resolveCustomerId(
        els["cart-add-form"].elements.customerId.value ||
          els["cart-update-form"].elements.customerId.value ||
          state.selectedCustomerId
      );
    const data = await request(`/cart/${customerId}`);
    renderCart(data);
    renderToBox("order-output", data);
  }

  async function onAddCartItem(event) {
    event.preventDefault();
    requireAuth();
    const formData = new FormData(event.currentTarget);
    const customerId = resolveCustomerId(formData.get("customerId"));
    const data = await request(`/cart/${customerId}/items`, {
      method: "POST",
      body: {
        productId: formData.get("productId").trim(),
        quantity: Number(formData.get("quantity"))
      }
    });
    renderCart(data);
    renderToBox("order-output", data);
  }

  async function onUpdateCartItem(event) {
    event.preventDefault();
    requireAuth();
    const formData = new FormData(event.currentTarget);
    const customerId = resolveCustomerId(formData.get("customerId"));
    const productId = formData.get("productId").trim();
    const data = await request(`/cart/${customerId}/items/${productId}`, {
      method: "PATCH",
      body: {
        quantity: Number(formData.get("quantity"))
      }
    });
    renderCart(data);
    renderToBox("order-output", data);
  }

  async function onRemoveCartItem() {
    requireAuth();
    const form = els["cart-update-form"];
    const customerId = resolveCustomerId(form.elements.customerId.value);
    const productId = form.elements.productId.value.trim();
    if (!productId) {
      throw new Error("Product ID is required to remove a cart item");
    }
    const data = await request(`/cart/${customerId}/items/${productId}`, { method: "DELETE" });
    renderCart(data);
    renderToBox("order-output", data);
  }

  async function onClearCart() {
    requireAuth();
    const customerId = resolveCustomerId(
      els["cart-update-form"].elements.customerId.value || els["cart-add-form"].elements.customerId.value
    );
    const data = await request(`/cart/${customerId}`, { method: "DELETE" });
    renderCart(data);
    renderToBox("order-output", data);
  }

  async function onCreateOrder(event) {
    event.preventDefault();
    requireAuth();
    const formData = new FormData(event.currentTarget);
    const customerId = resolveCustomerId(formData.get("customerId"));
    const data = await request("/orders", {
      method: "POST",
      body: {
        customerId,
        shippingAddress: parseJsonField(formData.get("shippingAddress"), "shippingAddress"),
        notes: formData.get("notes").trim()
      }
    });
    selectOrder(data.id, data);
    renderToBox("order-output", data);
    await onLoadCart();
    await onLoadOrders(new Event("submit"));
  }

  async function onLoadOrders(event) {
    if (event) {
      event.preventDefault();
    }
    requireAuth();
    const formData = new FormData(els["orders-filter-form"]);
    const params = buildParams({
      customerId: formData.get("customerId"),
      status: formData.get("status")
    });
    const data = await request(`/orders${params}`);
    renderOrders(data.items || []);
    renderToBox("order-output", data);
  }

  async function onLoadOrderDetail(event) {
    event.preventDefault();
    requireAuth();
    const orderId = new FormData(event.currentTarget).get("orderId").trim();
    const data = await request(`/orders/${orderId}`);
    selectOrder(orderId, data);
    renderToBox("order-output", data);
  }

  async function onUpdateOrderStatus(event) {
    event.preventDefault();
    requireAdmin();
    const formData = new FormData(event.currentTarget);
    const orderId = formData.get("orderId").trim();
    const data = await request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status: formData.get("status") }
    });
    selectOrder(orderId, data);
    renderToBox("order-output", data);
    await onLoadOrders(new Event("submit"));
  }

  async function onCancelOrder() {
    requireAuth();
    const orderId = els["order-detail-form"].elements.orderId.value.trim() || state.selectedOrderId;
    if (!orderId) {
      throw new Error("Order ID is required to cancel");
    }
    const data = await request(`/orders/${orderId}/cancel`, {
      method: "PATCH",
      body: {}
    });
    selectOrder(orderId, data);
    renderToBox("order-output", data);
    await onLoadOrders(new Event("submit"));
  }

  async function onCreatePayment(event) {
    event.preventDefault();
    requireAuth();
    const formData = new FormData(event.currentTarget);
    const customerId = resolveCustomerId(formData.get("customerId"));
    const data = await request("/payments", {
      method: "POST",
      body: {
        orderId: formData.get("orderId").trim(),
        customerId,
        amount: Number(formData.get("amount")),
        currency: formData.get("currency").trim() || "USD",
        method: formData.get("method"),
        paymentDetails: parseJsonField(formData.get("paymentDetails"), "paymentDetails")
      }
    });
    selectPayment(data.id, data);
    renderToBox("payment-output", data);
    await onLoadPayments();
  }

  async function onLoadPayments(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    requireAuth();
    const formData = new FormData(els["payments-filter-form"]);
    const params = buildParams({
      orderId: formData.get("orderId"),
      customerId: formData.get("customerId"),
      status: formData.get("status"),
      method: formData.get("method")
    });
    const data = await request(`/payments${params}`);
    renderPayments(data.items || []);
    renderToBox("payment-output", data);
  }

  async function onLoadPaymentDetail(event) {
    event.preventDefault();
    requireAuth();
    const paymentId = new FormData(event.currentTarget).get("paymentId").trim();
    const data = await request(`/payments/${paymentId}`);
    selectPayment(paymentId, data);
    renderToBox("payment-output", data);
  }

  async function onRefundPayment(event) {
    event.preventDefault();
    requireAuth();
    const formData = new FormData(event.currentTarget);
    const paymentId = formData.get("paymentId").trim();
    const rawAmount = formData.get("amount").trim();
    const body = rawAmount ? { amount: Number(rawAmount) } : {};
    const data = await request(`/payments/${paymentId}/refund`, {
      method: "POST",
      body
    });
    selectPayment(paymentId, data.payment || data);
    renderToBox("payment-output", data);
    await onLoadPayments();
  }

  async function onGetReceipt() {
    requireAuth();
    const paymentId = els["payment-detail-form"].elements.paymentId.value.trim() || state.selectedPaymentId;
    if (!paymentId) {
      throw new Error("Payment ID is required for receipt lookup");
    }
    const data = await request(`/payments/${paymentId}/receipt`);
    renderToBox("payment-output", data);
  }

  async function onUpdatePaymentStatus(event) {
    event.preventDefault();
    requireAdmin();
    const formData = new FormData(event.currentTarget);
    const paymentId = formData.get("paymentId").trim();
    const data = await request(`/payments/${paymentId}/status`, {
      method: "PATCH",
      body: { status: formData.get("status") }
    });
    selectPayment(paymentId, data);
    renderToBox("payment-output", data);
    await onLoadPayments();
  }

  async function request(path, options = {}) {
    const method = options.method || "GET";
    const url = `${state.baseUrl}${path}`;
    const headers = { Accept: "application/json", ...(options.headers || {}) };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }

    let response;
    let data;

    try {
      response = await fetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined
      });
      data = await readResponseBody(response);
    } catch (error) {
      pushActivity(`${method} ${path}`, "Network Error", { message: error.message }, true);
      renderResponse({ error: error.message, path, method });
      throw error;
    }

    pushActivity(`${method} ${path}`, response.ok ? "Success" : "Error", data, !response.ok);
    renderResponse(data);

    if (!response.ok) {
      const message = data && data.message ? data.message : `${method} ${path} failed`;
      const error = new Error(message);
      error.payload = data;
      throw error;
    }

    return data;
  }

  async function readResponseBody(response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return { message: await response.text() };
  }

  function setSession(data) {
    state.token = data.token;
    state.customer = data.customer;
    state.selectedCustomerId = data.customer ? data.customer.id : "";
    persistState();
    renderSession();
    renderSelections();
  }

  function renderSession() {
    els["session-role"].textContent = state.customer ? state.customer.role : "guest";
    renderToBox("session-output", state.customer ? { token: state.token, customer: state.customer } : "No active session.");
  }

  function renderSelections() {
    els["selected-customer-label"].textContent = state.selectedCustomerId || "none";
    els["customer-selection-summary"].textContent = state.selectedCustomerId
      ? `Current customer selection: ${state.selectedCustomerId}`
      : "No customer selected.";
  }

  function renderResponse(data) {
    state.latestResponse = data;
    persistState();
    els["response-viewer"].textContent = formatForDisplay(data);
  }

  function renderToBox(id, data) {
    els[id].textContent = formatForDisplay(data);
  }

  function renderProducts(products) {
    if (!products.length) {
      els["product-list"].innerHTML = emptyState("No products loaded yet.");
      return;
    }

    els["product-list"].innerHTML = products
      .map(
        (product) => `
          <article class="item-card">
            <h4>${escapeHtml(product.name)}</h4>
            <p>${escapeHtml(product.description)}</p>
            <div class="item-meta">
              <span class="pill">${escapeHtml(product.category)}</span>
              <span class="pill">${escapeHtml(product.currency)} ${escapeHtml(String(product.price))}</span>
              <span class="pill ${product.inventory === 0 ? "warn" : ""}">Stock ${escapeHtml(String(product.inventory))}</span>
            </div>
            <div class="inline-actions">
              <button class="btn subtle" type="button" data-action="select-product" data-product-id="${product.id}">Select</button>
              <button class="btn ghost" type="button" data-action="add-product-to-cart" data-product-id="${product.id}">Add To Cart</button>
            </div>
          </article>
        `
      )
      .join("");

    bindDynamicActions(els["product-list"]);
  }

  function renderCustomers(customers) {
    if (!customers.length) {
      els["customer-list"].innerHTML = emptyState("No customers loaded yet.");
      return;
    }

    els["customer-list"].innerHTML = customers
      .map(
        (customer) => `
          <article class="item-card">
            <h4>${escapeHtml(`${customer.firstName} ${customer.lastName}`)}</h4>
            <p>${escapeHtml(customer.email)}</p>
            <div class="item-meta">
              <span class="pill">${escapeHtml(customer.role)}</span>
              <span class="pill ${customer.status !== "active" ? "warn" : ""}">${escapeHtml(customer.status)}</span>
            </div>
            <div class="inline-actions">
              <button class="btn subtle" type="button" data-action="select-customer" data-customer-id="${customer.id}">Select</button>
            </div>
          </article>
        `
      )
      .join("");

    bindDynamicActions(els["customer-list"]);
  }

  function renderCart(cart) {
    const items = cart && Array.isArray(cart.items) ? cart.items : [];
    if (!items.length) {
      els["cart-summary"].innerHTML = emptyState("Cart is empty.");
      return;
    }

    els["cart-summary"].innerHTML = items
      .map(
        (item) => `
          <article class="item-card">
            <h4>${escapeHtml(item.name)}</h4>
            <p>Product ID: ${escapeHtml(item.productId)}</p>
            <div class="item-meta">
              <span class="pill">Qty ${escapeHtml(String(item.quantity))}</span>
              <span class="pill">Unit ${escapeHtml(String(item.unitPrice))}</span>
              <span class="pill">Subtotal ${escapeHtml(String(item.subtotal))}</span>
            </div>
            <div class="inline-actions">
              <button class="btn subtle" type="button" data-action="fill-cart-item" data-product-id="${item.productId}" data-quantity="${item.quantity}">Edit</button>
            </div>
          </article>
        `
      )
      .join("");

    bindDynamicActions(els["cart-summary"]);
  }

  function renderOrders(orders) {
    if (!orders.length) {
      els["order-list"].innerHTML = emptyState("No orders found.");
      return;
    }

    els["order-list"].innerHTML = orders
      .map(
        (order) => `
          <article class="item-card">
            <h4>Order ${escapeHtml(order.id)}</h4>
            <p>Customer: ${escapeHtml(order.customerId)}</p>
            <div class="item-meta">
              <span class="pill ${order.status === "cancelled" ? "warn" : ""}">${escapeHtml(order.status)}</span>
              <span class="pill">Items ${escapeHtml(String(order.items.length))}</span>
              <span class="pill">Total ${escapeHtml(String(order.totalAmount))}</span>
            </div>
            <div class="inline-actions">
              <button class="btn subtle" type="button" data-action="select-order" data-order-id="${order.id}">Select</button>
              <button class="btn ghost" type="button" data-action="prepare-payment" data-order-id="${order.id}" data-customer-id="${order.customerId}" data-amount="${order.totalAmount}">Pay</button>
            </div>
          </article>
        `
      )
      .join("");

    bindDynamicActions(els["order-list"]);
  }

  function renderPayments(payments) {
    if (!payments.length) {
      els["payment-list"].innerHTML = emptyState("No payments found.");
      return;
    }

    els["payment-list"].innerHTML = payments
      .map(
        (payment) => `
          <article class="item-card">
            <h4>Payment ${escapeHtml(payment.id)}</h4>
            <p>Order: ${escapeHtml(payment.orderId)}</p>
            <div class="item-meta">
              <span class="pill ${payment.status !== "completed" ? "warn" : ""}">${escapeHtml(payment.status)}</span>
              <span class="pill">${escapeHtml(payment.method)}</span>
              <span class="pill">${escapeHtml(String(payment.amount))} ${escapeHtml(payment.currency)}</span>
            </div>
            <div class="inline-actions">
              <button class="btn subtle" type="button" data-action="select-payment" data-payment-id="${payment.id}">Select</button>
            </div>
          </article>
        `
      )
      .join("");

    bindDynamicActions(els["payment-list"]);
  }

  function bindDynamicActions(container) {
    container.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          const { action, productId, customerId, orderId, paymentId, quantity, amount } = button.dataset;
          if (action === "select-product") {
            const data = await request(`/products/${productId}`);
            selectProduct(productId, data);
            renderToBox("product-output", data);
          }
          if (action === "add-product-to-cart") {
            els["cart-add-form"].elements.productId.value = productId;
            pushNotice(`Product ${productId} copied into cart form.`);
          }
          if (action === "select-customer") {
            state.selectedCustomerId = customerId;
            persistState();
            renderSelections();
            els["customer-status-form"].elements.customerId.value = customerId;
            els["profile-update-form"].elements.customerId.value = customerId;
            pushNotice(`Customer ${customerId} selected.`);
          }
          if (action === "fill-cart-item") {
            els["cart-update-form"].elements.productId.value = productId;
            els["cart-update-form"].elements.quantity.value = quantity;
            pushNotice(`Cart item ${productId} copied into update form.`);
          }
          if (action === "select-order") {
            const data = await request(`/orders/${orderId}`);
            selectOrder(orderId, data);
            renderToBox("order-output", data);
          }
          if (action === "prepare-payment") {
            els["payment-create-form"].elements.orderId.value = orderId;
            els["payment-create-form"].elements.customerId.value = customerId;
            els["payment-create-form"].elements.amount.value = amount;
            pushNotice(`Order ${orderId} copied into payment form.`);
          }
          if (action === "select-payment") {
            const data = await request(`/payments/${paymentId}`);
            selectPayment(paymentId, data);
            renderToBox("payment-output", data);
          }
        } catch (error) {
          handleError(error);
        }
      });
    });
  }

  function selectProduct(productId, product) {
    state.selectedProductId = productId;
    persistState();
    renderSelections();
    els["product-detail-form"].elements.productId.value = productId;
    els["product-create-form"].elements.id.value = productId;
    els["inventory-form"].elements.productId.value = productId;
    if (product) {
      els["product-create-form"].elements.name.value = product.name || "";
      els["product-create-form"].elements.description.value = product.description || "";
      els["product-create-form"].elements.category.value = product.category || "";
      els["product-create-form"].elements.price.value = product.price ?? "";
      els["product-create-form"].elements.currency.value = product.currency || "USD";
      els["product-create-form"].elements.sku.value = product.sku || "";
      els["product-create-form"].elements.inventory.value = product.inventory ?? 0;
      els["product-create-form"].elements.tags.value = Array.isArray(product.tags) ? product.tags.join(", ") : "";
    }
  }

  function selectOrder(orderId) {
    state.selectedOrderId = orderId;
    persistState();
    els["order-detail-form"].elements.orderId.value = orderId;
    els["order-status-form"].elements.orderId.value = orderId;
  }

  function selectPayment(paymentId) {
    state.selectedPaymentId = paymentId;
    persistState();
    els["payment-detail-form"].elements.paymentId.value = paymentId;
    els["refund-form"].elements.paymentId.value = paymentId;
    els["payment-status-form"].elements.paymentId.value = paymentId;
  }

  function prefillCustomerForms(customer) {
    els["profile-update-form"].elements.customerId.value = customer.id || "";
    els["profile-update-form"].elements.firstName.value = customer.firstName || "";
    els["profile-update-form"].elements.lastName.value = customer.lastName || "";
    els["profile-update-form"].elements.phone.value = customer.phone || "";
    els["profile-update-form"].elements.addresses.value = JSON.stringify(customer.addresses || [], null, 2);
    els["customer-status-form"].elements.customerId.value = customer.id || "";
  }

  function resolveCustomerId(rawValue) {
    const fromInput = String(rawValue || "").trim();
    if (fromInput) {
      state.selectedCustomerId = fromInput;
      persistState();
      renderSelections();
      return fromInput;
    }
    if (state.selectedCustomerId) {
      return state.selectedCustomerId;
    }
    if (state.customer && state.customer.id) {
      state.selectedCustomerId = state.customer.id;
      persistState();
      renderSelections();
      return state.customer.id;
    }
    throw new Error("Customer ID is required. Login or select a customer first.");
  }

  function requireAuth() {
    if (!state.token) {
      throw new Error("Login is required for this action.");
    }
  }

  function requireAdmin() {
    requireAuth();
    if (!state.customer || state.customer.role !== "admin") {
      throw new Error("Admin session required for this action.");
    }
  }

  function parseJsonField(value, label) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return [];
    }
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      throw new Error(`Invalid JSON in ${label}`);
    }
  }

  function buildParams(input) {
    const params = new URLSearchParams();
    Object.entries(input).forEach(([key, value]) => {
      const normalized = String(value || "").trim();
      if (normalized) {
        params.set(key, normalized);
      }
    });
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  function pushActivity(action, status, payload, isError) {
    state.activity.unshift({
      timestamp: new Date().toLocaleString(),
      action,
      status,
      payload
    });
    state.activity = state.activity.slice(0, 30);
    persistState();
    renderActivity();

    if (isError) {
      console.error(action, payload);
    } else {
      console.info(action, payload);
    }
  }

  function pushNotice(message) {
    pushActivity("UI", "Notice", { message }, false);
  }

  function renderActivity() {
    if (!state.activity.length) {
      els["activity-log"].innerHTML = emptyState("No activity yet.");
      return;
    }

    els["activity-log"].innerHTML = state.activity
      .map(
        (entry) => `
          <article class="log-item">
            <strong>${escapeHtml(entry.action)} · ${escapeHtml(entry.status)}</strong>
            <p>${escapeHtml(entry.timestamp)}</p>
            <p>${escapeHtml(shorten(formatForDisplay(entry.payload), 180))}</p>
          </article>
        `
      )
      .join("");
  }

  function renderEmptyStates() {
    if (!els["product-list"].innerHTML) {
      els["product-list"].innerHTML = emptyState("Product catalog cards will appear here.");
    }
    if (!els["customer-list"].innerHTML) {
      els["customer-list"].innerHTML = emptyState("Customer records will appear here.");
    }
    if (!els["cart-summary"].innerHTML) {
      els["cart-summary"].innerHTML = emptyState("Cart summary will appear here.");
    }
    if (!els["order-list"].innerHTML) {
      els["order-list"].innerHTML = emptyState("Order records will appear here.");
    }
    if (!els["payment-list"].innerHTML) {
      els["payment-list"].innerHTML = emptyState("Payment records will appear here.");
    }
  }

  function emptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  function formatForDisplay(data) {
    return typeof data === "string" ? data : JSON.stringify(data, null, 2);
  }

  function shorten(value, maxLength) {
    return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function handleError(error) {
    const message = error && error.message ? error.message : "Unexpected error";
    renderResponse({ error: message, payload: error.payload || null });
    pushActivity("UI Error", "Error", { message, payload: error.payload || null }, true);
    alert(message);
  }

  window.addEventListener("error", (event) => {
    handleError(event.error || new Error(event.message));
  });

  window.addEventListener("unhandledrejection", (event) => {
    handleError(event.reason || new Error("Unhandled promise rejection"));
  });
})();
