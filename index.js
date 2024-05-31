import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
let player1 = "";
let player2 = "";
let espS = "";
let boardPlayer1 = [];
let boardPlayer2 = [];
let playerAttack = "";
const ID_BOAT = "bs";
io.on("connection", (socket) => {
  socket.emit("new player", player1, player2);
  socket.on("load player", (user) => {
    console.log(user);
    if (user == "Espectador") {
      espS = user;
    } else if (player1 == "") {
      player1 = user;
      playerAttack = player1;
      io.emit("load player", player1);
    } else if (player2 == "" && user != player1) {
      player2 = user;
      io.emit("load player", player2);
    }
  });
  socket.on("start battle", (user, boardPlayer) => {
    if (player1 == user) {
      console.log("tablero 1");
      boardPlayer1 = boardPlayer;
      console.log(boardPlayer1);
    } else if (player2 == user) {
      console.log("tablero 2");
      boardPlayer2 = boardPlayer;
      console.log(boardPlayer2);
    }
    if (boardPlayer1.length > 0 && boardPlayer2.length > 0) {
      let start = true;
      io.emit("start battle", start);
    }
  });
  socket.on("attack", (user, point, row, column) => {
    if (user == playerAttack) {
      if (player1 == user) {
        if (boardPlayer2[row][column] == ID_BOAT) {
          point = 1;
          playerAttack = player2;
          io.emit("attack", player1, point, row, column, espS);
        } else {
          point = 0;
          playerAttack = player2;
          io.emit("attack", player1, point, row, column, espS);
        }
      } else if (player2 == user) {
        if (boardPlayer1[row][column] == ID_BOAT) {
          point = 1;
          playerAttack = player1;
          io.emit("attack", player2, point, row, column);
        } else {
          point = 0;
          playerAttack = player1;
          io.emit("attack", player2, point, row, column);
        }
      }
    }
  });
  socket.on("winner", (user) => {
    player1 = "";
    player2 = "";
    boardPlayer1 = [];
    boardPlayer2 = [];
    playerAttack = "";
    socket.broadcast.emit("winner", user);
  });
});

server.listen(3002, () => {
  console.log("server running on port 3002");
});
