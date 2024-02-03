// socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:10000");
// const socket = io("https://chat-app-busd.onrender.com/");

export default socket;
