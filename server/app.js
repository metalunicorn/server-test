const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const User = require("./models/User");
const Message = require("./models/Message");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", require("./routes/user.js"));

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const errorHandlers = require("./handlers/errorHadler");
const jwt = require("jsonwebtoken");


app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);

if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}
let admin = false;
async function start() {
  try {
    await mongoose.connect(process.env.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    server.listen(PORT, () =>
      console.log(`Server has been started on port ${PORT}...`)
    );
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const payload = await jwt.verify(token, process.env.SECRET);
        socket.userId = payload.id;
        socket.userName = payload.name
        
        const user = await User.findById(payload.id).exec()

          admin = user.admin
          if(user.ban){
            socket.disconnect()
            return
          }

        console.log('Real role: '+ user.admin)
        next();
      } catch (err) {}
    });


    const users = {}
    io.on("connection", async(socket) => {
      console.log("connected: " + socket.userId)
      users[socket.id] = {userId: socket.userId, name: socket.userName};
      const userAd = await User.findOne({_id: socket.userId})

      socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.userId);
        delete users[socket.id];
        io.emit("UsersOnline",{users: users})
      });
      io.emit("UsersOnline",{users: users})
      socket.on("Message", async ({ message }) => {
        if (lastMessage.length && (Date.now()-lastMessage[0].time)<15000) {
          return
        };
        if (newMessage.message.length > 200) {
          return
        };
        if(user.mute){
          return
        }
        if(user.ban){
          socket.disconnect()
          return
        }
        if (message.trim().length > 0) {
        const user = await User.findOne({ _id: socket.userId });
        const newMessage = new Message({
          user: socket.userId,
          message: message,
          time: Date.now(),
        });
        const lastMessage = await Message.find({user : socket.userId }).limit(1).sort({$natural:-1}).exec()
        io.emit("newMessage", {
          user: user.name,
          color: user.color,
          message: message,
          userId: socket.userId,
        });
        await newMessage.save();
      }
      });
      // if(socket.admin){
      //   console.log("admin: ya")
      //   const allUsers =  User.find({"name":""}).exec()
      //   console.log(allUsers)
      //   io.on("AllUsers",()=>{
      //     console.log('result')
      //     // const allUsers = await  User.find({"name":""}).exec()
      //     // console.log(allUsers)
      //     // io.emit("AllUsersADD",{
      //     //   message: allUsers
      //     // })
      //   })
      // }
      // if(socket.admin) {
      //   console.log('admin')
      //   io.on("AllUsers", async(result)=>{
      //   console.log("socket.admin.AllUsers: "+ socket.admin)
      //   console.log(result)
      // })
      // }
      socket.on("AllUsers", async(result)=>{
        if(userAd.admin){
          const allUsers = await  User.find({},["name","mute"]).exec()
          // console.log(allUsers)
          io.emit("ShowAllUsers", {
            allUsers: allUsers
          })
        }
      })
      socket.on("Mute", async({_id})=>{3
        
       
        if(userAd.admin){
          console.log("Yes")
         const muteUser = await User.findOne({_id: _id })
         if(muteUser.mute){
           console.log("unmute")
          muteUser.mute = false
          await muteUser.save()
          return
         }
         console.log("User mute: ",_id)
         muteUser.mute = true
         await muteUser.save()
        }
      })
      socket.on("Ban", async({_id})=>{
        if(userAd.admin){
        console.log(_id)
         const muteUser = await User.findOne({_id: _id })
         if(muteUser.ban){
           console.log("unBan")
          muteUser.ban = false
          await muteUser.save()
          return
         }
         console.log("User Ban: ",_id)
         muteUser.ban = true
         await muteUser.save()
        }
      })
    });
    require("./models/User");
    
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}

start();

module.exports = app;
