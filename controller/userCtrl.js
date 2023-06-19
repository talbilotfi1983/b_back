const User = require("../models/userModel");
const Coordonnee = require("../models/coordonneeModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const { sendEmail } = require("./emailCtrl");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshtoken");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const jwt = require("jsonwebtoken");
const Garage = require("../models/garageModel");
crypto = require("crypto");
const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findCoordonnee = await Coordonnee.findOne({ email });
  if (!findCoordonnee) {
    const { firstname, lastname } = req.body;
    const infosUser = {
      firstname,
      lastname,
    };
    const user = await User.create(infosUser);
    const { email, mobile, adress, city, password, role } = req.body;
    const infosCoordonnee = {
      email,
      mobile,
      adress,
      city,
      password,
      role,
      user: user._id,
    };
    let newCoodonnee = await Coordonnee.create(infosCoordonnee);
    newCoodonnee = await newCoodonnee.populate("user");
    res.json(newCoodonnee);
  } else {
    res.sendStatus(702);
  }
});
const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  let findCoordonnee = await Coordonnee.findOne({ email: email });
  if (findCoordonnee && (await findCoordonnee.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findCoordonnee._id);
    await Coordonnee.findByIdAndUpdate(
      findCoordonnee._id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    let resp = {
      _id: findCoordonnee._id,
      email: findCoordonnee.email,
      mobile: findCoordonnee.mobile,
      role: findCoordonnee.role,
      token: generateToken(findCoordonnee._id),
      password: findCoordonnee.password,
    };
    if (findCoordonnee.role === "garage") {
      findCoordonnee = await findCoordonnee.populate("garage");
      resp.name = findCoordonnee.garage.name;
      resp.logo = findCoordonnee.garage.logo;
    } else {
      findCoordonnee = await findCoordonnee.populate("user");
      resp.firstname = findCoordonnee.user.firstname;
      resp.lastname = findCoordonnee.user.lastname;
    }
    res.json(resp);
  } else {
    throw new Error("Invalid credentials");
  }
});
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refreshToken in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (user) {
    await User.findOneAndUpdate(refreshToken, {
      refreshToken: "",
    });
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refreshToken in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refreshToken present in database");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.id !== user.id) {
      throw new Error("There is somting wrong with refreshToken");
    }
    const accessToken = generateToken(user?.id);
    res.json({ accessToken });
  });
});
const getUsers = asyncHandler(async (req, res) => {
  console.log("users");
  try {
    const users = await User.find();
    res.json(users);
  } catch (e) {
    throw new Error(e);
  }
});
const getOneUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findById(id);
    if (user) res.json(user);
    else throw new Error("User not exist");
  } catch (e) {
    throw new Error("User not exist");
  }
});
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndDelete(id);
    res.json(user);
  } catch (e) {
    throw new Error(e);
  }
});
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        firstname: req.body?.firstname,
        lastname: req.body?.lastname,
        email: req.body?.email,
        mobile: req.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(user);
  } catch (e) {
    throw new Error(e);
  }
});
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        blocked: true,
      },
      {
        new: true,
      }
    );
    res.json({ message: "User blocked" });
  } catch (e) {
    throw new Error(e);
  }
});
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        blocked: false,
      },
      {
        new: true,
      }
    );
    res.json({ message: "User unblocked" });
  } catch (e) {
    throw new Error(e);
  }
});
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(id);
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const coordonnee = await Coordonnee.findOne({ email });
  if (!coordonnee) throw new Error("User not found whith this email");
  try {
    const token = await coordonnee.createPasswordResetToken();
    await coordonnee.save();
    const resetURl = `Hi, please follow this link to reset your password, This link is valid 10 mn from now <a href='http://localhost:5001/api/user/resetPassword/${token}'>Click here</a>`;
    const data = {
      to: email,
      subject: "Forgot password",
      htm: resetURl,
      text: "Hey user",
    };
    sendEmail(data);
    res.json(token);
  } catch (e) {
    throw new Error(e);
  }
});
const contactAdmin = asyncHandler(async (req, res) => {
  const { subject, message, email, firstname, lastname, mobile } = req.body;
  try {
    const resetURl = `${firstname} ${lastname} <br/> 
             Email : ${email} <br/>
             Telephone : ${mobile} <br/>
             Message : ${message}<br/>`;
    const data = {
      to: process.env.EMAIL_ADMIN,
      subject: subject,
      htm: resetURl,
      text: "Hey user",
    };
    sendEmail(data);
    res.json({ message: "success" });
  } catch (e) {
    throw new Error(e);
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOneAndUpdate({
    passwordResetToken: hashedToken,
    passwordResetExpires: new Date(Date.now()),
  });
  if (!user) throw new Error("Token expired, please try againe later.");
  user.password = password;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  res.send(user);
});
const getWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.body;
  try {
    const user = await User.findById(_id).populate("wishlist");
    res.json(user);
  } catch (e) {
    throw new Error(e);
  }
});
const saveUserAdress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { address } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      _id,
      {
        address: address,
      },
      { new: true }
    );
    res.json(user);
  } catch (e) {
    throw new Error(e);
  }
});
const addUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const { cart } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyUserCart = await Cart.findOne({ orderby: user._id });
    if (alreadyUserCart) {
      alreadyUserCart.remove();
    }
    const products = [];
    let cartTotal = 0;

    for (let i = 0; i < cart.length; i++) {
      let obj = {};
      obj.product = cart[i]._id;
      obj.count = cart[i].count;
      obj.color = cart[i].color;
      const product = await Product.findById(cart[i]._id)
        .select("price")
        .exec();
      obj.price = product.price;
      products.push(obj);
      cartTotal += Number(obj.price) * Number(obj.count);
    }
    let newCart = await new Cart({
      products: products,
      cartTotal: cartTotal,
      orderby: user._id,
    }).save();
    newCart = await newCart.populate("products.product");
    res.json(newCart);
  } catch (e) {
    throw new Error(e);
  }
});
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    const alreadyUserCart = await Cart.findOne({ orderby: user._id }).populate(
      "products.product"
    );
    if (alreadyUserCart) {
      res.json(alreadyUserCart);
    }
  } catch (e) {
    throw new Error(e);
  }
});
const removeUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  console.log(_id);
  try {
    const alreadyUserCart = await Cart.findOneAndRemove({ orderby: _id });
    res.json(alreadyUserCart);
  } catch (e) {
    throw new Error(e);
  }
});
const applayCoupon = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const { title } = req.body;
  try {
    const coupon = await Coupon.findOne({ title: title });
    const user = await User.findById(_id);
    const { cartTotal } = await Cart.findOne({ orderby: user._id });
    const totalAfterDiscount = cartTotal * (1 - coupon.discount / 100);
    const newcart = await Cart.findOneAndUpdate(
      { orderby: _id },
      { totalAfterDiscount: totalAfterDiscount },
      { new: true }
    );
    res.json(newcart);
  } catch (e) {
    throw new Error(e);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    const userCart = await Cart.findOne({ orderby: user._id });
    const finalAmount =
      couponApplied && userCart.totalAfterDiscount
        ? userCart.totalAfterDiscount
        : userCart.cartTotal;
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on delivry",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: "Cash on delivry",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (e) {
    throw new Error(e);
  }
});
const getOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const userOrder = await Order.findOne({ orderby: _id });
    res.json(userOrder);
  } catch (e) {
    throw new Error(e);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(_id);

  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: { status: status },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (e) {
    throw new Error(e);
  }
});
module.exports = {
  removeUserCart,
  createUser,
  login,
  getUsers,
  getOneUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishList,
  saveUserAdress,
  addUserCart,
  getUserCart,
  applayCoupon,
  createOrder,
  getOrder,
  updateOrderStatus,
  contactAdmin,
};
