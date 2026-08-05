const Product = require("../../models/products.model");
const filterStatusHelper = require("../../helper/filterstatus");
const searchHelper = require("../../helper/search");
const paginatonHelper = require("../../helper/pagination");
const system_config = require("../../config/system");
const accounts = require("../../models/accounts.model");
//[GET] /admin/products
module.exports.index = async (req, res) => {
  // console.log(req.query);
  const filterStatus = filterStatusHelper(req.query);

  let find = {
    delete: false,
  };
  if (req.query.status) {
    find.status = req.query.status;
  }
  const objectSearch = searchHelper(req.query);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  //pagination
  const coutProduct = await Product.countDocuments(find);
  let objectPagination = paginatonHelper(
    {
      currentPage: 1,
      limitItem: 4,
    },
    req.query,
    coutProduct,
  );
  //end pagination
  const sortKey = req.query.valueKey || "position";
  const sortValue = req.query.value === "desc" ? -1 : 1;
  const products2 = await Product.find(find)
    .sort({
      [sortKey]: sortValue,
    })
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
  let find_acc = {
    role_id: res.locals.user.role_id,
  };
  const acc = await accounts.findOne(find_acc);
  res.render("admin/pages/products/index", {
    pagetitle: "Trang sản phẩm",
    products: products2,
    category: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
    accounts: acc,
  });
};
//[PATH] /change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status: status });

  req.session.success = ["CẬP NHẬT THÀNH CÔNG"];

  res.redirect(req.get("referer"));
};
//[PATCH] /change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(",");
  switch (type) {
    case "InStock":
      await Product.updateMany({ _id: { $in: ids } }, { status: "InStock" });
      break;
    case "OutStock":
      await Product.updateMany({ _id: { $in: ids } }, { status: "OutStock" });
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          delete: true,
          deletedBy: {
            account_id: res.locals.user.role_id,
            deletedAt: new Date(),
          },
        },
      );
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne({ _id: id }, { position: position });
      }
      break;
    default:
      break;
  }
  res.redirect(req.get("referer"));
};

//[DELETE] /delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  // await Product.deleteOne({ _id: id });
  await Product.updateOne(
    { _id: id },
    {
      delete: true,
      deletedBy: {
        account_id: res.locals.user.role_id,
        deletedAt: new Date(),
      },
    },
  );
  req.session.success = ["CẬP NHẬT THÀNH CÔNG"];

  res.redirect(req.get("referer"));
};

//[GET] /create

module.exports.create_products = async (req, res) => {
  let find = {
    delete: false,
  };
  const products = await Product.find(find);
  console.log(products);
  res.render("admin/pages/products/create", {
    pagetitle: "TẠO MỚI SẢN PHẨM",
    products: products,
  });
};

//[POST] /create

module.exports.create_products_post = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position == "") {
    const countProduct = await Product.countDocuments({});
    req.body.position = countProduct + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  req.body.createdBy = {
    account_id: res.locals.user.role_id,
  };
  const product = new Product(req.body);

  await product.save();
  res.redirect(`${system_config.prefixAdmin}/products`);
};

//[GET] /admin/products/edit/:id
module.exports.edit_products = async (req, res) => {
  let find = {
    delete: false,
    _id: req.params.id,
  };
  const products = await Product.findOne(find);
  res.render("admin/pages/products/edit", {
    pagetitle: "Sửa Sản Phẩm",
    products: products,
  });
};

//[PATCH] /admin/products/edit/:id
module.exports.edit_products_patch = async (req, res) => {
  const id = req.params.id;
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  if (req.body.position == "") {
    const countProduct = await Product.countDocuments({});
    req.body.position = countProduct + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  req.body.createdBy = {
    account_id: res.locals.user.role_id,
  };

  const updateData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    featured: req.body.featured,
    discountPercentage: req.body.discountPercentage,
    stock: req.body.stock,
    position: req.body.position,
    status: req.body.status,
  };
  if (req.body.product_category_id) {
    updateData.product_category_id = req.body.product_category_id;
  }
  if (req.file) {
    updateData.thumbnail = req.body.thumbnail;
  }
  try {
    const updatedBy_con = {
      account_id: res.locals.user.role_id,
      updatedAt: new Date(),
    };
    await Product.updateOne(
      { _id: id },
      {
        $set: updateData,
        $push: { updatedBy: updatedBy_con },
      },
    );
    res.redirect(`${system_config.prefixAdmin}/products`);
  } catch (error) {
    console.error(error);
    res.redirect(`${system_config.prefixAdmin}/products`);
  }
};

//[GET] /admin/products/detail/:id

module.exports.detail_products = async (req, res) => {
  // console.log(req.params.id);
  const product = await Product.findOne({ _id: req.params.id });
  // console.log(product);
  res.render("admin/pages/products/detail", {
    product: product,
  });
};
