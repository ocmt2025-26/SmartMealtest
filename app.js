const MENU = [
    { id: 1, name: 'Chicken Burger🍔', price: 1.50, type: 'main' },
    { id: 2, name: 'Shawarma Sandwich🌯', price: 1.10, type: 'main' },
    { id: 3, name: 'Black Coffee☕', price: 1.00, type: 'drinks' },
    { id: 4, name: 'French Fries 🍟', price: 0.70, type: 'main' },
    { id: 5, name: 'Choco Cake Slice🍰', price: 1.20, type: 'dessert' },
    { id: 6, name: 'Cookies🍪', price: 1.00, type: 'dessert' },
    { id: 7, name: 'Karak Tea ☕', price: 0.10, type: 'drinks' },
    { id: 8, name: 'Pizza🍕', price: 2.80, type: 'main' },
    { id: 9, name: 'Orange Fresh Juice🥤', price: 1.10, type: 'drinks' },
    { id: 10, name: 'Mango Fresh Juice 🥤', price: 1.10, type: 'drinks' },
    { id: 11, name: 'Ice Cream 🍦', price: 0.30, type: 'dessert' }
];

const ADMIN_CREDENTIALS = { email: "admin@ocmt.edu.om", password: "admin123" };

function getCart() { return JSON.parse(localStorage.getItem('smartmeal_cart') || '[]'); }
function saveCart(c) { localStorage.setItem('smartmeal_cart', JSON.stringify(c)); updateCartCount(); }
function getOrders() { return JSON.parse(localStorage.getItem('smartmeal_orders') || '[]'); }
function saveOrders(o) { localStorage.setItem('smartmeal_orders', JSON.stringify(o)); }
function getUser() { return JSON.parse(localStorage.getItem('smartmeal_user') || 'null'); }
function saveUser(u) { localStorage.setItem('smartmeal_user', JSON.stringify(u)); updateProfileLink(); renderProfile(); }

function renderMenuGrid(type = 'all') {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const items = MENU.filter(i => type==='all'?true:i.type===type);
    items.forEach(it => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${it.name}</h3>
            <div class="price">${it.price.toFixed(2)} OMR</div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn primary" onclick="addToCart(${it.id})">Add to Cart</button>
                <button class="btn ghost" onclick="viewItem(${it.id})">View</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterType(type, el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if(el) el.classList.add('active');
    renderMenuGrid(type);
}

function viewItem(id) {
    const it = MENU.find(m => m.id===id);
    if(!it) return;
    toast(it.name + " - " + it.price.toFixed(2) + " OMR");
}

function addToCart(id) {
    const it = MENU.find(m => m.id===id);
    if(!it) return;
    const cart = getCart();
    const existing = cart.find(c=>c.id===id);
    if(existing) existing.qty+=1;
    else cart.push({ id: it.id, name: it.name, price: it.price, qty: 1 });
    saveCart(cart);
    toast(it.name+" added to cart");
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s,i)=>s+i.qty,0);
    const el = document.getElementById('cartCount');
    if(el) el.innerText = count;
}

function renderCartPage() {
    const container = document.getElementById('cartContainer');
    if(!container) return;
    const cart = getCart();
    container.innerHTML='';
    if(cart.length===0){ container.innerHTML='<p>Your cart is empty.</p>'; return; }
    cart.forEach((item,idx)=>{
        const div = document.createElement('div');
        div.className='cart-item';
        div.innerHTML=`
            <div>
                <strong>${item.name}</strong><br>
                ${item.price.toFixed(2)} OMR
            </div>
            <div class="qty">
                <button onclick="changeQty(${idx}, -1)">-</button>
                <div>${item.qty}</div>
                <button onclick="changeQty(${idx}, 1)">+</button>
                <button style="margin-left:10px" onclick="removeItem(${idx})">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
    calculateTotals();
}

function changeQty(index, delta){
    const cart = getCart();
    if(!cart[index]) return;
    cart[index].qty+=delta;
    if(cart[index].qty<1) cart.splice(index,1);
    saveCart(cart);
    renderCartPage();
}

function removeItem(index){
    const cart = getCart();
    if(!cart[index]) return;
    cart.splice(index,1);
    saveCart(cart);
    renderCartPage();
}

function calculateTotals(){
    const cart = getCart();
    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const total = subtotal;
    const elSub = document.getElementById('subtotal');
    const elTot = document.getElementById('total');
    if(elSub) elSub.innerText=subtotal.toFixed(2);
    if(elTot) elTot.innerText=total.toFixed(2);
}

function confirmOrder(){
    const cart = getCart();
    if(cart.length===0){ toast('Your cart is empty'); return; }

    const user = getUser();
    if(!user){ toast('Please login first'); return; }

    const deliveryTimeInput = document.getElementById("deliveryTime");
    const paymentMethod = document.getElementById("paymentMethod");

    const deliveryTime = deliveryTimeInput?.value || "Not selected";
    const payment = paymentMethod?.value || "Cash";

    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const total = subtotal.toFixed(2);

    const orders = getOrders();
    const order = {
        id: Date.now(),
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        items: cart,
        subtotal,
        total,
        payment,
        deliveryTime,
        created: new Date().toISOString(),
        status: "Preparing"
    };

    orders.unshift(order);
    saveOrders(orders);

    localStorage.removeItem("smartmeal_cart");
    updateCartCount();

    renderCartPage();
    renderProfile();
    renderAdmin();

    toast("Order placed! It will be ready at " + deliveryTime);
}

function cancelOrder(orderId){
    const orders = getOrders();
    const index = orders.findIndex(o=>o.id===orderId);
    if(index===-1) return;

    if(orders[index].status==="Completed" || orders[index].status==="Ready"){
        toast("Order cannot be cancelled");
        return;
    }

    orders[index].status="Cancelled";
    saveOrders(orders);

    renderProfile();
    renderAdmin();

    toast("Order cancelled");
}

function renderProfile(){
    const profileBox = document.getElementById('profileBox');
    const orderHistory = document.getElementById('orderHistory');
    const user = getUser();
    if(!profileBox) return;

    if(!user){
        profileBox.innerHTML='<p>Please login to view profile</p>';
        if(orderHistory) orderHistory.innerHTML='';
        return;
    }

    profileBox.innerHTML=`
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone || '-'}</p>
        <button class="btn ghost" onclick="logout()">Logout</button>
    `;

    if(orderHistory){
        const orders = getOrders().filter(o=>o.userEmail===user.email);
        if(orders.length===0){ orderHistory.innerHTML='<p>No orders yet</p>'; }
        else{
            orderHistory.innerHTML='';
            orders.forEach(o=>{
                const div = document.createElement('div');
                div.className='order-item';
                div.innerHTML=`
                    <p><strong>Order #${o.id}</strong> - ${o.status}</p>
                    <ul>
                        ${o.items.map(i=>`<li>${i.name} x ${i.qty}</li>`).join('')}
                    </ul>
                    <p>Total: ${o.total} OMR</p>
                    <button class="btn ghost" onclick="cancelOrder(${o.id})">Cancel</button>
                `;
                orderHistory.appendChild(div);
            });
        }
    }
}

function logout(){
    localStorage.removeItem('smartmeal_user');
    updateProfileLink();
    renderProfile();
    toast('Logged out');
}

function updateProfileLink(){
    const link = document.getElementById('profileLink');
    const user = getUser();
    if(!link) return;
    if(user) link.innerText='Profile';
    else link.innerText='Account';
}

function doLogin(){
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();

    if(!email || !password){ toast('Email and password required'); return; }

    if(email===ADMIN_CREDENTIALS.email && password===ADMIN_CREDENTIALS.password){
        saveUser({ name: 'Admin', email, phone });
        toast('Admin logged in');
        if(location.pathname.endsWith('login.html')) location.href='admin.html';
        return;
    }

    saveUser({ name: name||'User', email, phone });
    toast('Login successful');
    if(location.pathname.endsWith('login.html')) location.href='profile.html';
}

function toast(msg){
    const t = document.createElement("div");
    t.className="toast";
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(()=>{ t.remove(); },2000);
}

window.addEventListener('DOMContentLoaded',()=>{
    updateCartCount();
    updateProfileLink();
    renderMenuGrid('all');
    renderCartPage();
    renderProfile();
    if(location.pathname.endsWith('admin.html')) renderAdmin?.();
});

