import express from "express";
import dbConnection from "../db/dbconfig.js";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const authRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/profilepictures");
  },
  filename: (req, file, cb) => {
    cb(null, "Image-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

authRouter.post("/register", upload.single("profilePicture"), (req, res) => {
  const { username, password, fullname, email, phone_number } = req.body;
  const insertQuery = `
    INSERT INTO dbusers (username, password, fullname, email, phone_number, profilePicture)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const profilePicture = req.file ? req.file.path : null;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const values = [
    username,
    hashedPassword,
    fullname,
    email,
    phone_number,
    profilePicture,
  ];
  const userNameExistQuery = `SELECT * FROM dbusers WHERE username = ?`;

  dbConnection.query(userNameExistQuery, [username], (err, result) => {
    if (err) {
      return res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    }
    if (result.length > 0) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }
    dbConnection.query(insertQuery, values, (err, result) => {
      if (err) {
        return res.status(400).json({
          message: "Something Went Wrong ",
          error: err,
        });
      }
      res.status(200).json({
        message: "User Created Successfully",
        result,
      });
    });
  });
});
authRouter.post("/login", (req, res) => {
  const { username, email, phone_number, password } = req.body;
  const selectQuery = `SELECT * FROM dbusers WHERE username = ? OR email = ? OR phone_number = ?`;

  const values = [username, email, phone_number];

  dbConnection.query(selectQuery, values, (err, result) => {
    if (err) {
      return res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    }
    if (!result.length) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = result[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET);
    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  });
});
export default authRouter;
