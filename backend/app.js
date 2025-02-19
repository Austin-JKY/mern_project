const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongonSanitize = require("express-mongo-sanitize");
const AppError = require("./middleware/appError");
const errorController = require("./controller/errorController");
const authRouter = require("./routes/Auth");
const userRouter = require("./routes/User");
const postRouter = require("./routes/Post");

const path = require("path");

const app = express();

app.use("/", express.static("uploads"));
app.use(cookieParser());
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

app.use(mongonSanitize());

// Routes for auth
app.use("/api/v1/users", authRouter);

// Routes for user
app.use("/api/v1/users", userRouter);

// Routes for post
app.use("/api/v1/posts", postRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);
module.exports = app;
