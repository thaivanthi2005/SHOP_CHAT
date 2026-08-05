const Product = require("../../models/products.model");
const Order = require("../../models/order.model");
const productsHelper = require("../../helper/pricenew");

// [GET] /orders
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;

  const orders = await Order.find({
    cart_id: cartId,
    deleted: false,
  }).sort({ createdAt: -1 });

  for (const order of orders) {
    for (const product of order.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id,
      }).select("title thumbnail");
      product.pricenew = productsHelper.pricenewSingle(product);
      product.productInfo = productInfo;
      product.totalPrice = product.pricenew * product.quantity;
    }
    order.totalPrice = order.products.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
  }

  res.render("client/pages/orders/index", {
    pagetitle: "Đơn Hàng",
    orders: orders,
  });
};

// [GET] /orders/detail/:orderId
module.exports.detail = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    cart_id: req.cookies.cartId,
    deleted: false,
  });

  if (!order) {
    req.session.error = ["Không tìm thấy đơn hàng"];
    return res.redirect("/orders");
  }

  for (const product of order.products) {
    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("title thumbnail");
    product.pricenew = productsHelper.pricenewSingle(product);
    product.productInfo = productInfo;
    product.totalPrice = product.pricenew * product.quantity;
  }
  order.totalPrice = order.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  res.render("client/pages/orders/detail", {
    pagetitle: "Chi Tiết Đơn Hàng",
    order: order,
  });
};
