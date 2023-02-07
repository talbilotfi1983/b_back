const express = require('express');
const {
    createUser, login, getUsers, getOneUser, deleteUser, forgotPasswordToken, resetPassword,
    updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, getWishList,
    saveUserAdress, addUserCart, getUserCart, removeUserCart, applayCoupon,createOrder,getOrder
} = require('../controller/userCtrl');
const {authMiddlewares, isAdmin, isBlocked} = require('../middlewares/authMiddlewares');
const router = express.Router();
router.post("/add", createUser);
router.post("/forgotPasswordToken", forgotPasswordToken);
router.post("/resetPassword", forgotPasswordToken);
router.post("/login", login);
router.post("/addUserCart", authMiddlewares, addUserCart);
router.post("/createOrder", authMiddlewares, createOrder);
router.get("/logout", logout);
router.get("/getWishlist", authMiddlewares, getWishList);
router.get("/getUserCart", authMiddlewares, getUserCart);
router.get("/all", authMiddlewares, isAdmin, isBlocked, getUsers);
router.get("/refresh", handleRefreshToken);
router.get("/getOrder", authMiddlewares, getOrder);
router.get("/:id", authMiddlewares, isAdmin, isBlocked, getOneUser);
router.delete("/removeUserCart", authMiddlewares, removeUserCart);
router.delete("/:id", deleteUser);
router.put("/resetPassword/:token", resetPassword);
router.put("/updatePassword", authMiddlewares, updatePassword);
router.put("/saveUserAdress", authMiddlewares, saveUserAdress);
router.put("/applayCoupon", authMiddlewares, applayCoupon);
router.put("/:id", updateUser);
router.put("/block/:id", authMiddlewares, isAdmin, isBlocked, blockUser);
router.put("/unblock/:id", authMiddlewares, isAdmin, isBlocked, unblockUser);
module.exports = router;