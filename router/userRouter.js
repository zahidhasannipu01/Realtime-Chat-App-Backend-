import express from "express";
import dbConnection from "./../db/dbconfig.js";
import { io } from "../index.js";
const userRouter = express.Router();
import path from "path";

userRouter.get("/users", (req, res) => {
  const selectQuery = `SELECT id, username, fullname, email, phone_number, profilePicture, isOnline, onlineTime, createdat FROM dbusers`;

  dbConnection.query(selectQuery, (err, result) => {
    if (err) {
      return res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    }

    const users = result.map((user) => {
      return {
        ...user,
        profilePicture: user.profilePicture
          ? path.basename(user.profilePicture)
          : null,
      };
    });

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  });
});

userRouter.put("/user-status/:id", (req, res) => {
  const { id } = req.params;
  const { isOnline } = req.body;
  const updateQuery = `UPDATE dbusers SET isOnline = ? WHERE id = ?`;
  dbConnection.query(updateQuery, [id, isOnline], (err, result) => {
    if (err) {
      return res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    }
    io.emit("user-status-changed", { id, isOnline });
    res.status(200).json({
      message: "User status updated successfully",
      result,
    });
  });
});

export default userRouter;
