let cart = [];

function addToCart(name, price) {

    cart.push({ name, price });

    alert(name + " added to cart!");

}

function loadCart() {

    let container = document.getElementById("cartItems");

    let total = 0;

    cart.forEach((item, i) => {

        container.innerHTML += `
<div class="cart-item">
<h3>${item.name}</h3>
<p>${item.price} OMR</p>
<button onclick="removeItem(${i})">Remove</button>
</div>

        `;

        total += item.price;

    });

    document.getElementById("totalPrice").innerText = total.toFixed(2);

}

function removeItem(i) {

    cart.splice(i, 1);

    location.reload();

}

function confirmOrder() {

    alert("Your order has been sent to the cafeteria and will be ready in 10 minutes.");

}

window.onload = function () {

    if (document.getElementById("cartItems")) {

        loadCart();

    }

};
 
