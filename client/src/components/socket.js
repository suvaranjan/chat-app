// socket.js
import { io } from "socket.io-client";

const socket = io("https://chat-app-busd.onrender.com");
// const socket = io("https://chat-app-busd.onrender.com/");

export default socket;
