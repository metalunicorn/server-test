/* eslint-disable @typescript-eslint/no-var-requires */
const jwtCheck = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

interface IO {
  use: (arg0: (socket: any, next: any) => Promise<void>) => void;
  on: (arg0: string, arg1: (socket: any) => Promise<void>) => void;
  emit: (
    arg0: string,
    arg1: {
      users?: any;
      prevMessages?: any;
      message?: string;
      user?: any;
      color?: any;
      userId?: any;
    }
  ) => void;
  sockets: {
    sockets: {
      get: (arg0: any) => {
        (): any;
        new (): any;
        disconnect: { (): void; new (): any };
      };
    };
  };
}

const SocketIO = function socketIoStart(io: IO): void {
  io.use(async (socket, next) => {
    try {
      if (!socket.handshake.auth.token) {
        return;
      }

      const { token } = socket.handshake.auth;
      const payload = jwtCheck.verify(token, process.env.SECRET);
      interface User {
        _id: string;
        name: string;
        password: string;
        color: string;
        admin: boolean;
        mute: boolean;
        ban: boolean;
      }
      const user: User = await User.findOne({ name: payload.name }).exec();
      if (!user) {
        return;
      }

      // eslint-disable-next-line no-param-reassign

      socket.user = <boolean>(
        Object.prototype.hasOwnProperty.call(socket, 'user')
      )
        ? socket.user
        : user;
      if (user.ban) {
        socket.disconnect();
        return;
      }
      next();
    } catch (err) {
      socket.disconnect();
    }
  });
  type Users = {
    [users: string]: {
      name: string;
      socket: string;
    };
  };

  const users = <Users>{};
  io.on('connection', async (socket) => {
    users[socket.user.name] = { name: socket.user.name, socket: socket.id };
    socket.on('disconnect', () => {
      delete users[socket.user.name];
      io.emit('UsersOnline', users);
    });

    io.emit('UsersOnline', users);

    const showAllusers = async () => {
      if (!socket.user.admin) {
        return;
      }

      interface allUsers {
        _id: string;
        name: string;
        admin: boolean;
        mute: boolean;
        ban: boolean;
      }

      const allUsers: [allUsers] = await User.find({}, [
        'name',
        'mute',
        'ban',
        'admin',
      ]).exec();
      socket.emit('ShowAllUsers', allUsers);
    };

    showAllusers();

    interface lastMessages {
      _id: string;
      message: string;
      id: string;
      user: string;
      time: string;
      color: string;
    }

    const lastMessages: [lastMessages] = await Message.find({})
      .limit(10)
      .sort('-time')
      .exec();
    io.emit('Messages', { prevMessages: lastMessages });

    socket.on('Message', async (send: { message: string }) => {
      const userMute = await User.findById(socket.user.id).exec();
      if (userMute.mute) {
        return;
      }

      if (!(send.message.trim().length > 0) || send.message.length > 200) {
        return;
      }

      interface lastMessage {
        _id: string;
        message: string;
        user: string;
        time: number;
        color: string;
        crearedAt: Date;
        updatedAt: Date;
      }

      const lastMessage: [lastMessage] = await Message.find({
        id: socket.user.id,
      })
        .limit(1)
        .sort({ $natural: -1 })
        .exec();
      if (
        lastMessage.length &&
        Date.now() - lastMessage[0].time < Number(process.env.TIMEMESSAGE)
      ) {
        return;
      }

      const newMessage = new Message({
        message: send.message,
        id: socket.user.id,
        user: socket.user.name,
        time: Date.now(),
        color: socket.user.color,
      });

      await newMessage.save();

      io.emit('newMessage', {
        message: send.message,
        user: socket.user.name,
        color: socket.user.color,
        userId: socket.user.id,
      });
    });

    interface ID {
      _id: string;
    }

    socket.on('Mute', async (user: ID) => {
      if (!socket.user.admin) {
        return;
      }
      const muteUser = await User.findById(user._id);
      muteUser.mute = !muteUser.mute;
      await muteUser.save();
      showAllusers();
    });

    socket.on('Ban', async (user: { _id: string }) => {
      if (!socket.user.admin) {
        return;
      }
      const UserIsBan = await User.findById(user._id);
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
