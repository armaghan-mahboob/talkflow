import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false,
});

let onlineUsers = [];

socket.on("online-users", (userIds) => {
  onlineUsers = userIds;
});

export const getOnlineUsers = () => onlineUsers;
