import express from "express";
import dbConnection from "./../db/dbconfig.js";
const messageRouter = express.Router();

messageRouter.get("/messages/:sender_id/:recever_id", (req, res) => {
  const { sender_id, recever_id } = req.params;
  const selectQuery = `SELECT * FROM dbmessages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY createdAt ASC`;

  dbConnection.query(
    selectQuery,
    [sender_id, recever_id, recever_id, sender_id],
    (err, result) => {
      if (err) {
        return res.status(400).json({
          message: "Something went wrong",
          error: err,
        });
      }
      res.status(200).json({
        message: "Messages retrieved successfully",
        messages: result,
      });
    }
  );
});

export default messageRouter;
