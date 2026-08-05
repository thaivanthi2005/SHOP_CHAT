// Cập nhật số lượng sản phẩm trong giỏ hàng
const input_quantity = document.querySelectorAll("input[name='quantity']");
input_quantity.forEach((item) => {
  item.addEventListener("change", (e) => {
    const productId = e.target.getAttribute("product_id");
    let quantity = parseInt(e.target.value, 10);
    const min = parseInt(e.target.min, 10) || 1;
    const max = parseInt(e.target.max, 10);

    if (isNaN(quantity) || quantity < min) {
      quantity = min;
      e.target.value = quantity;
    }
    if (!isNaN(max) && quantity > max) {
      quantity = max;
      e.target.value = quantity;
      alert(`Chỉ còn tối đa ${max} sản phẩm`);
    }

    if (!productId) return;
    window.location.href = `/cart/update/${productId}/${quantity}`;
  });
});
// Hết cập nhật số lượng sản phẩm trong giỏ hàng
