import dbConnection from "../db/dbconfig.js";
import { io } from "../index.js";

export const getStatusUpdate = (data) => {
  if (data) {
    const updateQuery = `UPDATE dbusers SET isOnline = 1 WHERE id = ?`;
    const isOnline = 1;

    dbConnection.query(updateQuery, [data], (err, result) => {
      if (err) {
        console.log("Something went wrong", err);
      } else {
        console.log("User status updated successfully");
        io.emit("userStatusChanged", {
          userId: data.id,
          isOnline,
        });
      }
    });
  }
};

export const GetStatusOffline = (userId) => {
  if (!userId) return;

  const updateQuery = `UPDATE dbusers SET isOnline = 0 WHERE id = ?`;
  const isOnline = 0;

  dbConnection.query(updateQuery, [userId], (err, result) => {
    if (err) {
      console.log("Something went wrong", err);
    } else {
      console.log("User is now offline", userId);

      io.emit("userStatusChanged", {
        userId,
        isOnline,
      });
    }
  });
};
