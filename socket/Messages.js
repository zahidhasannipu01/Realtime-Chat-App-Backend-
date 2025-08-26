import dbConnection from "../db/dbconfig.js";
import { io } from "./../index.js";

export const GetAndSavedMessages = (data, onlineUsers) => {
  if (!data) {
    console.log("Data is not available");
    return;
  }

  const { sender_id, receiver_id, message, isSeen, createdAt } = data;

  const insertQuery = `
    INSERT INTO dbmessages (sender_id, receiver_id, message, isSeen, createdAt) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    sender_id,
    receiver_id,
    message,
    isSeen ?? 0,
    createdAt ?? new Date(),
  ];

  dbConnection.query(insertQuery, values, (err, result) => {
    if (err) {
      console.log("Something went wrong", err);
      return;
    }

    const savedMessage = {
      id: result.insertId,
      sender_id,
      receiver_id,
      message,
      isSeen: isSeen ?? 0,
      createdAt: createdAt ?? new Date(),
    };

    console.log("Message saved successfully", savedMessage);

    // Emit back to sender with DB-inserted message
    const senderSocket = onlineUsers[sender_id];
    if (senderSocket) {
      io.to(senderSocket).emit("newMessage", savedMessage);
    }

    // Emit to receiver if online
    const receiverSocket = onlineUsers[receiver_id];
    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", savedMessage);
    }
  });
};
