const express = require("express");
const morgan = require("morgan");
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const productCategoryRoute = require("./routes/productCategoryRoute");
const blogCategoryRoute = require("./routes/blogCategoryRoute");
const blogRoute = require("./routes/blogRoute");
const brandRoute = require("./routes/brandRoute");
const couponRoute = require("./routes/couponRoute");
const bodyParser = require("body-parser");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");
dbConnect();
/*
app.use('/', (req, res) => {
    res.send('Hello from server side');
})
 */
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/user", authRouter);
app.use("/api/product", productRoute);
app.use("/api/productCategory", productCategoryRoute);
app.use("/api/blogCategoryRoute", blogCategoryRoute);
app.use("/api/blog", blogRoute);
app.use("/api/brand", brandRoute);
app.use("/api/coupon", couponRoute);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
