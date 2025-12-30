// //Backend\server.js
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// dotenv.config();
// import http from 'http';
// import morgan from 'morgan';
// import nocache from 'nocache';
// import path ,{ dirname } from 'path';
// import { fileURLToPath } from 'url';
// import authRoutes from './routes/auth/authRoutes.js'; 
// import userRoutes from './routes/user/user.js'; 
// import userDataRoutes from './routes/user/userData.js'
// import chatRoutes from './routes/user/chatRoutes.js';
// import adminRoutes from './routes/admin/admin.js'
// import { errorHandler } from './middlewares/errorHandler.js';
// import { connectDB } from './connection/databse.js';
// import {Server as SocketIoServer} from 'socket.io';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


// const app = express(); 
// const server = http.createServer(app);  
// const io = new SocketIoServer(server , {
//     pingTimeout : 60000,  
//     cors : {
//         origin: " https://career-upp-bz9i.onrender.com",
//         methods: ["GET", "POST"],
//         credentials : true
//     }
// });

// //https://career-upp-bz9i.onrender.com

// const corsOptions = {
//     origin: [
//         "https://career-upp-bz9i.onrender.com",
//         "http://localhost:5173",
//         "https://careerup.website",
//         "http://localhost:3000",
//         "http://localhost:3001"
//     ],
//     methods: 'GET,PUT,PATCH,POST,DELETE',
// };

// app.use(cors(corsOptions));
// app.use(nocache());
// app.use(morgan('dev'));
// // STATIC frontend
// app.use(express.static(path.join(__dirname, "../Frontend/dist")));

// // app.use(express.static(path.join(__dirname,"../Frontend/dist")));
// app.use(express.static('Backend/public/resumes')); 
// app.use(express.json()); 
// app.use(express.urlencoded({extended : true})); 

// //user auth routes
// app.use('/auth' , authRoutes);

// //user routes
// app.use('/' , userRoutes);

// //user-data routes
// app.use('/' , userDataRoutes);

// //chat routes
// app.use('/' , chatRoutes);

// //admin routes
// app.use('/admin' , adminRoutes);

// app.use(errorHandler); 

// connectDB();


// io.on('connection' , (socket) => {

//     //chat related events starting
//     socket.on('start' , (userData) => { 
//         socket.join(userData);   //starting a chat
//         console.log(userData , 'ith login userinte id');
//     });

//     socket.on('join chat' , (chatRoom) => {
//         socket.join(chatRoom);
//         console.log('joined the room : '  + chatRoom);
//     })
    

//     socket.on('new chat message' , (message) => {

//         // console.log('here toooo');
//         const chat = message.chat;

//         // console.log(chat , 'ith chat');

//         if(!chat.participants){
//             // console.log('no participants');
//         }
//         chat.participants.forEach((user) => {
//             if(user._id === message.sender._id){
//                 return;
//             }

//             return socket.in(user._id).emit('message recieved' , message);
//         })
//     });   

//     socket.on('disconnect' , () => {
//         // console.log('disconnected');
//     });
// })


// // app.get("*", function (req, res) {
// //     res.sendFile(path.join(__dirname,"../Frontend/dist/index.html"));
// // });
// // React Router fallback (LAST)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
// });
// const port = process.env.PORT || 3000;
// server.listen(port , () => {
//     console.log(`server on http://localhost:${port}`);
// })

// Backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import morgan from "morgan";
import nocache from "nocache";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Server as SocketIoServer } from "socket.io";

import authRoutes from "./routes/auth/authRoutes.js";
import userRoutes from "./routes/user/user.js";
import userDataRoutes from "./routes/user/userData.js";
import chatRoutes from "./routes/user/chatRoutes.js";
import adminRoutes from "./routes/admin/admin.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "./connection/databse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */
const io = new SocketIoServer(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://career-upp-bz9i.onrender.com",
    credentials: true,
  },
});

/* =========================
   MIDDLEWARES
========================= */
app.use(
  cors({
    origin: [
      "https://career-upp-bz9i.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: "GET,PUT,PATCH,POST,DELETE",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(nocache());

/* =========================
   STATIC FILES
========================= */
// React build
app.use(express.static(path.join(__dirname, "../Frontend/dist")));

// Uploaded resumes
app.use("/resumes", express.static(path.join(__dirname, "public/resumes")));

/* =========================
   API ROUTES (PREFIXED)
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-data", userDataRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   DATABASE
========================= */
connectDB();

/* =========================
   SOCKET EVENTS
========================= */
io.on("connection", (socket) => {
  socket.on("start", (userId) => {
    socket.join(userId);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new chat message", (message) => {
    const chat = message.chat;
    if (!chat?.participants) return;

    chat.participants.forEach((user) => {
      if (user._id === message.sender._id) return;
      socket.in(user._id).emit("message received", message);
    });
  });
});

/* =========================
   REACT ROUTER FALLBACK
========================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
