const Product1 = require("../../models/category.model");
const system_config = require("../../config/system");

module.exports.category = async (req, res) => {
  const categories = await Product1.find({ delete: false }).lean();
  const categoryTree = createTree(categories, "");
  res.render("admin/pages/category/index", {
    pagetitle: "Danh mục sản phẩm",
    products: categoryTree,
  });
};

// --------------------Create--------------------------------

function createTree(arr, parentId = "") {
  const tree = [];

  arr.forEach((item) => {
    if (item.parent_id == parentId) {
      const newItem = {
        ...item, // QUAN TRỌNG
      };

      const children = createTree(arr, item._id.toString());

      if (children.length > 0) {
        newItem.children = children;
      }

      tree.push(newItem);
    }
  });

  return tree;
}

module.exports.category_create = async (req, res) => {
  const categories = await Product1.find().lean();
  const categoryTree = createTree(categories, "");
  res.render("admin/pages/category/create", {
    pagetitle: "Tạo danh mục sản phẩm",
    products: categoryTree,
  });
};

module.exports.category_create_post = async (req, res) => {
  const product = new Product1(req.body);
  await product.save();
  res.redirect(req.get("referer"));
};

// --------------------END-Create--------------------------------

//[GET] _-------------------------- Edit -----------------------------
module.exports.category_edit = async (req, res) => {
  let find = {
    _id: req.params.id,
    delete: false,
  };
  const categories = await Product1.find().lean();
  const categoryTree = createTree(categories, "");
  const products = await Product1.findOne(find);
  res.render("admin/pages/category/edit", {
    pagetitle: "Sửa danh mục sản phẩm",
    products: products,
    product_category: categoryTree,
  });
};
// [GET]_--------------------------END Edit -----------------------------

module.exports.category_edit_patch = async (req, res) => {
  const id = req.params.id;
  const updateData = {
    title: req.body.title,
    parent_id: req.body.parent_id,
    description: req.body.description,
    position: req.body.position,
    status: req.body.status,
  };
  if (req.file) {
    updateData.thumbnail = req.body.thumbnail;
  }
  try {
    await Product1.updateOne({ _id: id }, updateData);
    res.redirect(`${system_config.prefixAdmin}/category`);
  } catch (error) {
    res.redirect(`${system_config.prefixAdmin}/product`);
  }
};

// [GET]_--------------------------delete -----------------------------
module.exports.category_delete = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    await Product1.updateOne(
      { _id: id },
      {
        delete: true,
      },
    );
    res.redirect(`${system_config.prefixAdmin}/category`);
  } catch {
    res.redirect(`${system_config.prefixAdmin}/dashboard`);
  }
};
