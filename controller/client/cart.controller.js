const Product = require("../../models/products.model");
const Cart = require("../../models/cart.model");

//[POST] /add/:productId"
module.exports.addcart = async (req, res) => {
  const cartId = req.cookies.cartId;
  const product_id = req.params.productId;
  const quantity = parseInt(req.body.quantity) || 0;
  const referer = req.get("referer") || "/products";

  if (quantity < 1) {
    req.session.error = ["Số lượng không hợp lệ"];
    return res.redirect(referer);
  }

  const product = await Product.findOne({ _id: product_id, delete: false });
  if (!product) {
    req.session.error = ["Sản phẩm không tồn tại"];
    return res.redirect(referer);
  }

  if (product.stock < quantity) {
    req.session.error = [
      `Chỉ còn ${product.stock} sản phẩm trong kho`,
    ];
    return res.redirect(referer);
  }

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    req.session.error = ["Giỏ hàng không tồn tại"];
    return res.redirect(referer);
  }

  const existProductInCart = cart.products.find(
    (item) => item.product_id == product_id,
  );

  if (existProductInCart) {
    const quantityNew = quantity + existProductInCart.quantity;
    await Cart.updateOne(
      {
        _id: cartId,
        "products.product_id": product_id,
      },
      {
        $set: {
          "products.$.quantity": quantityNew,
        },
      },
    );
  } else {
    await Cart.updateOne(
      { _id: cartId },
      {
        $push: {
          products: {
            product_id: product_id,
            quantity: quantity,
          },
        },
      },
    );
  }

  await Product.updateOne(
    { _id: product_id },
    { $inc: { stock: -quantity } },
  );

  req.session.success = ["Thêm Giỏ Hàng Thành Công"];
  res.redirect(referer);
};

// [GET] /cart
module.exports.index = async (req, res) => {
  const cart = await Cart.findOne({
    _id: req.cookies.cartId,
  });

  let productInfoList = [];

  if (cart && cart.products.length > 0) {
    for (const item of cart.products) {
      const productInfo = await Product.findOne({
        _id: item.product_id,
      });
      if (productInfo) {
        productInfoList.push({
          ...productInfo._doc,
          quantity: item.quantity,
          // stock đã trừ khi thêm giỏ → max = còn lại + số đang có trong giỏ
          maxQuantity: productInfo.stock + item.quantity,
          pricenew: (
            (productInfo.price * (100 - productInfo.discountPercentage)) /
            100
          ).toFixed(0),
        });
      }
    }
  }

  res.render("client/pages/cart/index", {
    pagetitle: "Giỏ Hàng",
    productInfo: productInfoList,
  });
};

// [GET] /delete/:id
module.exports.delete_products = async (req, res) => {
  const cartId = req.cookies.cartId;
  const product_id = req.params.id;

  const cart = await Cart.findOne({ _id: cartId });
  if (cart) {
    const itemInCart = cart.products.find(
      (item) => item.product_id == product_id,
    );
    if (itemInCart) {
      await Product.updateOne(
        { _id: product_id },
        { $inc: { stock: itemInCart.quantity } },
      );
    }
  }

  await Cart.updateOne(
    { _id: cartId },
    {
      $pull: {
        products: { product_id: product_id },
      },
    },
  );
  req.session.success = ["Xóa Sản Phẩm Giỏ Hàng Thành Công"];
  res.redirect(`/cart`);
};

//[GET] /update/:productId/:quantity
module.exports.update_quantity = async (req, res) => {
  const cartId = req.cookies.cartId;
  const product_id = req.params.productId;
  const quantityNew = parseInt(req.params.quantity);

  if (isNaN(quantityNew) || quantityNew < 1) {
    req.session.error = ["Số lượng không hợp lệ"];
    return res.redirect(`/cart`);
  }

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    req.session.error = ["Giỏ hàng không tồn tại"];
    return res.redirect(`/cart`);
  }

  const itemInCart = cart.products.find(
    (item) => item.product_id == product_id,
  );
  if (!itemInCart) {
    req.session.error = ["Sản phẩm không có trong giỏ hàng"];
    return res.redirect(`/cart`);
  }

  const quantityOld = itemInCart.quantity;
  const diff = quantityNew - quantityOld;

  if (diff === 0) {
    return res.redirect(`/cart`);
  }

  const product = await Product.findOne({ _id: product_id });
  if (!product) {
    req.session.error = ["Sản phẩm không tồn tại"];
    return res.redirect(`/cart`);
  }

  // Tăng số lượng → cần còn đủ stock
  if (diff > 0 && product.stock < diff) {
    req.session.error = [
      `Chỉ còn ${product.stock} sản phẩm trong kho`,
    ];
    return res.redirect(`/cart`);
  }

  await Cart.updateOne(
    {
      _id: cartId,
      "products.product_id": product_id,
    },
    {
      $set: {
        "products.$.quantity": quantityNew,
      },
    },
  );

  // diff > 0: trừ stock, diff < 0: hoàn stock
  await Product.updateOne(
    { _id: product_id },
    { $inc: { stock: -diff } },
  );

  req.session.success = ["Cập Nhật Số Lượng Giỏ Hàng Thành Công"];
  res.redirect(`/cart`);
};
