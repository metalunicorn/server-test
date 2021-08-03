import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:5050';
// Its Hook
function useChat() {
  const [messages, setMessages] = useState([]);
  const [usersOnline, setUsersOnline] = useState();
  const [showAllUsers, setShowAllUsers] = useState([]);
  const socketRef = useRef(null);
  const history = useHistory();

  useEffect(() => {
    // eslint-disable-next-line no-undef
    const token = localStorage.getItem('authToken');
    if (token) {
      socketRef.current = io(SERVER_URL, {
        auth: {
          // eslint-disable-next-line no-undef
          token: localStorage.getItem('authToken'),
        },
      });
    }
    if (!socketRef.current) {
      history.push('/auth');
      return;
    }

    socketRef.current.on('connect', () => {
    });

    socketRef.current.on('UsersOnline', ({ users }) => {
      const userOnline = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const key in users) {
        if (key) {
          userOnline.push(users[key]);
        }
      }

      setUsersOnline(userOnline);
    });

    socketRef.current.on('disconnect', () => {
      socketRef.current.disconnect();
      // eslint-disable-next-line no-undef
      localStorage.removeItem('authToken');
      history.push('/auth');
    });

    socketRef.current.on('ShowAllUsers', async ({ allUsers }) => {
      const allUsersArray = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const key in allUsers) {
        if (key) {
          allUsersArray.push(allUsers[key]);
        }
      }

      setShowAllUsers(allUsersArray);
    });

    socketRef.current.on('Messages', ({ prevMessages }) => {
      setMessages(prevMessages.reverse());
    });
    socketRef.current.on('newMessage', (message) => {
      setMessages((prevState) => [...prevState, message]);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = (messageText) => {
    socketRef.current.emit('Message', {
      message: messageText,
    });
  };

  const mute = (_id) => {
    socketRef.current.emit('Mute', {
      _id,
    });
  };

  const ban = (_id) => {
    socketRef.current.emit('Ban', {
      _id,
    });
  };

  const disconnect = () => {
    socketRef.current.disconnect();
    // eslint-disable-next-line no-undef
    localStorage.removeItem('authToken');
    history.push('/auth');
    // eslint-disable-next-line no-undef
    window.location.reload();
  };

  return {
    showAllUsers,
    ban,
    disconnect,
    messages,
    mute,
    sendMessage,
    usersOnline,
  };
}

export default useChat;
