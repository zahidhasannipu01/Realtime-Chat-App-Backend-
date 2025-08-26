import mysql from "mysql";

const config = {
  localhost: "localhost",
  user: "root",
  password: "",
  database: "realchat",
};

const dbConnection = mysql.createConnection(config);

dbConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});
export default dbConnection;
