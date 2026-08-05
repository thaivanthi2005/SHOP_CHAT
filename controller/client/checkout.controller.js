const Product = require("../../models/products.model");
const Category = require("../../models/category.model");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const productsHelper = require("../../helper/pricenew");
//[GET] /checkout
module.exports.index = async (req, res) => {
  const cart = await Cart.findOne({
    _id: req.cookies.cartId,
  });

  let productInfoList = [];

  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productInfo = await Product.findOne({
        _id: item.product_id,
      });
      if (productInfo) {
        productInfoList.push({
          ...productInfo._doc,
          quantity: item.quantity,
          pricenew: (
            (productInfo.price * (100 - productInfo.discountPercentage)) /
            100
          ).toFixed(0), // thêm giá mới
        });
      }
    }
  }
  res.render("client/pages/checkout/index", {
    pagetitle: "Đặt Hàng",
    productInfo: productInfoList,
  });
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
  const cartId = req.cookies.cartId;
  const userInfo = req.body;

  const cart = await Cart.findOne({
    _id: cartId,
  });
  const products = [];
  for (const product of cart.products) {
    const objectProduct = {
      product_id: product.product_id,
      price: 0,
      discountPercentage: 0,
      quantity: product.quantity,
    };
    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("price discountPercentage");

    objectProduct.price = productInfo.price;
    objectProduct.discountPercentage = productInfo.discountPercentage;

    products.push(objectProduct);
  }

  const orderInfo = {
    cart_id: cartId,
    userInfo: userInfo,
    products: products,
  };
  const order = new Order(orderInfo);
  order.save();
  await Cart.updateOne(
    {
      _id: cartId,
    },
    {
      products: [],
    },
  );
  res.redirect(`/checkout/success/${order.id}`);
};

//[GET]/success/:orderID
module.exports.success = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderID,
  });
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
  res.render("client/pages/checkout/success", {
    pagetitle: "Đặt Hàng Thành Công",
    order: order,
  });
};
