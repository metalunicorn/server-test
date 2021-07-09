import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { useEffect, useRef, useState } from "react";
import { history } from "../layout/index";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useScrollTrigger } from "@material-ui/core";
import io from "socket.io-client";

const PageChat = () => {
  const [socket, setSocket] = useState(null);
  const role = useSelector((state) => state);
  const [messages, setMessages] = useState([]);
  const [disabled, setDisabled] = useState(Boolean);
  const [usersOnline, setUsersOnline] = useState();
  const [allUsers, setAllUsers] = useState([]);
  const messageRef = useRef();

  useEffect(() => {
    setupSocket();
  }, []);

  const setupSocket = () => {
    const token = localStorage.getItem("authToken");
    if (token && !socket) {
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: localStorage.getItem("authToken"),
        },
      });
      console.log(newSocket, "23");

      newSocket.on("disconnect", () => {
        setSocket(null);
        setTimeout(setupSocket, 5000);
        localStorage.removeItem("authToken");
        window.location.reload();
        console.log("disconnect");
      });

      newSocket.on("connect", () => {
        console.log("socket connected");
      });
      console.log(newSocket, "24");
      setSocket(newSocket);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message) => {
        const newMessages = [...messages, message];
        setMessages(newMessages);
      });
    }
  }, [socket, messages]);

  useEffect(() => {
    if (socket) {
      socket.on("UsersOnline", async ({ users }) => {
        const userOnline = [];
        for (const key in users) {
          // console.log(users[key])
          userOnline.push(users[key]);
        }

        // console.log(userOnline)
        setUsersOnline(userOnline);
      });
      if (role.login.payload.admin) {
        socket.emit("AllUsers", { message: "HEllo" });
        socket.on("ShowAllUsers", async ({ allUsers }) => {
          console.log(allUsers);
          setAllUsers(allUsers);
        });
      }
    }

    if (socket) {
      console.log("AllUsers");
    }
  }, [socket, usersOnline]);

  const sendMessage = async () => {
    if (socket) {
      await socket.emit("Message", {
        message: messageRef.current.value,
      });
      setTimeout(() => setDisabled(false), 15000);
      setDisabled(true);
    }
    console.log("send");
    messageRef.current.value = "";
    console.log(role);
  };
  const disconnect = () => {
    socket.disconnect();
    localStorage.removeItem("authToken");
    window.location.reload();

    // io.sockets.connected[socket.id].disconnect()
  };

  const mute = async(_id,mute) => {
    if (role.login.payload.admin) {
      socket.emit("AllUsers", { message: "HEllo" });
      socket.on("ShowAllUsers", async ({ allUsers }) => {
        console.log(allUsers);
        setAllUsers(allUsers);
      });
    }
    if(socket) {
      await socket.emit("Mute", {
        _id: _id
      })
    }
    
  }

  const ban = async(_id,mute) => {
    if(socket) {
      await socket.emit("Ban", {
        _id: _id
      })
    }
    
  }

  return (
    <div className="chatroomPage">
      <div className="UsersOnline">
        <div className="cardHeader">Users Online</div>
        {usersOnline &&
          usersOnline.map((user, i) => (
            <div key={i} className="userOnline">
              {`${user.name}: Online`}
              {/* {console.log(user)} */}
            </div>
          ))}
      </div>
      {role.login.payload && role.login.payload.admin ? (
        <div className="UsersOnline">
          <div className="cardHeader">All Users</div>
          {allUsers.map((user, i) => (
            <div key={i} className="userBD">
              {`${user.name}`}
              <div className="buttonsAdmin">
                {user.mute?<div>
                  <Button
                    variant="contained"
                    size='small'
                    onClick={()=>mute(user._id,user.mute)}
                  >
                    UNMUTE
                  </Button>
                </div>:<div>
                  <Button
                    variant="contained"
                    size='small'
                    onClick={()=>mute(user._id)}
                  >
                    MUTE
                  </Button>
                </div>}
                
                <div>
                <Button
                  variant="contained"
                  size='small'
                  color="secondary"
                  onClick={() => ban(user._id)}
                >
                  BAN
                </Button>
              </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
      <div className="chatroomSection">
        <div className="chatroomContent">
          <div className="message">
            {messages.map((message, i) => (
              <div
                key={i}
                className="message"
                style={{ color: `${message.color}` }}
              >
                {`${message.user}:${message.message}`}
              </div>
            ))}
          </div>
        </div>

        <div className="chatroomActions">
          <div>
            <input
              type="text"
              name="message"
              placeholder="Say something!"
              ref={messageRef}
            />
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              disabled={disabled}
              onClick={sendMessage}
            >
              Send
            </Button>
          </div>
          <div>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => disconnect()}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(PageChat);
