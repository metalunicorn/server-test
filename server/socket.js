const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

const SocketIO = function socketIoStart(io) {
  io.use(async (socket, next) => {
    try {
      if (!socket.handshake.auth.token) {
        return;
      }

      const { token } = socket.handshake.auth;
      const payload = jwt.verify(token, process.env.SECRET);
      const user = await User.findOne({ name: payload.name }).exec();
      if (!user) {
        return;
      }

      // eslint-disable-next-line no-param-reassign
      socket.user = Object.prototype.hasOwnProperty.call(socket, 'user') ? socket.user : user;
      if (user.ban) {
        socket.disconnect();
        return;
      }
      next();
    } catch (err) {
      socket.disconnect();
    }
  });

  const users = {};
  io.on('connection', async (socket) => {
    users[socket.user.name] = { name: socket.user.name, socket: socket.id };

    socket.on('disconnect', () => {
      delete users[socket.user.name];
      io.emit('UsersOnline', { users });
    });

    io.emit('UsersOnline', { users });

    const showAllusers = async () => {
      if (!socket.user.admin) {
        return;
      }

      const allUsers = await User.find({}, [
        'name',
        'mute',
        'ban',
        'admin',
      ]).exec();
      socket.emit('ShowAllUsers', {
        allUsers,
      });
    };

    showAllusers();

    const lastMessages = await Message.find({})
      .limit(10)
      .sort('-time')
      .exec();

    io.emit('Messages', { prevMessages: lastMessages });

    socket.on('Message', async ({ message }) => {
      const userMute = await User.findById(socket.user.id).exec();
      if (userMute.mute) {
        return;
      }

      if (!(message.trim().length > 0) || message.length > 200) {
        return;
      }

      const lastMessage = await Message.find({ id: socket.user.id })
        .limit(1)
        .sort({ $natural: -1 })
        .exec();
      if (
        lastMessage.length
        && Date.now() - lastMessage[0].time < process.env.TIMEMESSAGE
      ) {
        return;
      }

      const newMessage = new Message({
        message,
        id: socket.user.id,
        user: socket.user.name,
        time: Date.now(),
        color: socket.user.color,
      });

      io.emit('newMessage', {
        message,
        user: socket.user.name,
        color: socket.user.color,
        userId: socket.user.id,
      });

      await newMessage.save();
    });

    socket.on('Mute', async ({ _id }) => {
      if (!socket.user.admin) {
        return;
      }

      const muteUser = await User.findOne({ _id });
      muteUser.mute = !muteUser.mute;
      await muteUser.save();
      showAllusers();
    });

    socket.on('Ban', async ({ _id }) => {
      if (!socket.user.admin) {
        return;
      }
      const UserIsBan = await User.findOne({ _id });
      UserIsBan.ban = !UserIsBan.ban;

      if (UserIsBan.ban && users[UserIsBan.name]) {
        io.sockets.sockets.get(users[UserIsBan.name].socket).disconnect();
      }

      await UserIsBan.save();
      showAllusers();
    });
  });
};

module.exports = SocketIO;
