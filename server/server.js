const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const { getUserIdFromSocketId, findAvailableUsers } = require("./helper/helper");

require('dotenv').config();
const connect = require("../server/config/db");
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const UserStatus = require("./models/UserStatus");



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

const port = process.env.PORT;

app.get("/", (req, res) => {
    res.status(200).json({ message: "hello world" });
});

app.use("/api", authRoutes, userRoutes, chatRoutes);

const onlineUsers = {};

// Socket.IO connection event
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('setup', (userId) => {
        socket.join(userId);
        socket.emit('connected');
        onlineUsers[userId] = socket.id;
    });

    socket.on('join chat', (room) => {
        socket.join(room);
    })


    socket.on('new message', (data) => {

        const recipients = data.participants.filter((id) => id !== data.loginUserId);
        recipients.forEach((id) => {
            io.to(id).emit('message received', data.message);
        });
    });

    socket.on("typing-start", data => {
        io.to(data.chatId).emit('typing on', data);
    })

    socket.on("typing-stop", data => {
        io.to(data.chatId).emit('typing off', data);
    })

    socket.on('getUsersStatus', data => {
        const { users, chatId } = data;
        const availableOnlineUsers = findAvailableUsers(onlineUsers, users);
        io.to(chatId).emit('recieved onlineUsers', availableOnlineUsers);
    });

    socket.on("friend reqSent", data => {
        const { requester, toUserId } = data;
        io.to(toUserId).emit('friend reqRecieved', requester);
    });

    socket.on("friend reqReject", data => {
        console.log(data);
        const { rejecter, toUserId } = data;
        io.to(toUserId).emit('friend reqRejected', rejecter);
    })

    socket.on("friend reqAccept", data => {
        const { newChat, toUserId } = data;
        io.to(toUserId).emit('friend reqAccepted', data);
    })

    socket.on("friend delete", data => {
        console.log(data);
        const { deleteUserId, toUserId } = data;
        io.to(toUserId).emit('friend deleted', deleteUserId);
    });

    socket.on("new group", data => {
        const { group, sendTo } = data;

        sendTo.forEach((id) => {
            io.to(id).emit('group created', group);
        });
    });

    socket.on("member removed", data => {
        const { groupId, memberIds, removedUserId, loginUserId } = data;

        memberIds.forEach((id) => {
            if (id !== loginUserId) {
                io.to(id).emit('member-is-removed', data);
            }
        });

        if (!memberIds.includes(removedUserId)) {
            io.to(removedUserId).emit('member-is-removed', data);
        }
    });

    socket.on('members added', data => {
        const { updatedMembers, newParticipants, groupId, loginUserId } = data;
        const membersIds = updatedMembers.map((m) => m._id);

        membersIds.forEach((id) => {
            if (id !== loginUserId) {
                io.to(id).emit('members-are-added', data);
            }
        })
    });

    socket.on("admin changed", data => {
        console.log(data);
        data.membersIds.forEach((id) => {
            if (id !== data.loginUserId) {
                io.to(id).emit('admin-is-changed', data);
            }
        })
    })

    socket.on('disconnect', async () => {
        const userId = getUserIdFromSocketId(socket.id, onlineUsers);
        if (userId !== null) {
            delete onlineUsers[userId];
            console.log('a user is now offline with id ', userId);

            try {
                let userStatus = await UserStatus.findOne({ user: userId });
                userStatus.status = 'offline';
                userStatus.lastSeen = new Date();
                await userStatus.save();
            } catch (error) {
                console.log(error.message);
            }
        }
    });
});

// connect().then(() => {
//     try {
//         server.listen(port, () => {
//             console.log(`Server connected to http://localhost:${port}`);
//         });
//     } catch (error) {
//         console.log(error.message);
//     }
// });

connect().then(() => {
    console.log("Server connected!");
});
