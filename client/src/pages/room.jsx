import React, { useState, useEffect, useContext } from "react";
import { withRouter, Redirect, Link } from "react-router-dom";
import {
  getUser,
  sendMessage,
  joinRoom,
  leaveRoom,
  getPersonnesRoom,
  clearContext,
  getRoom,
  typing,
  stopTyping,
} from "../sockets/emit";
import UIFx from "uifx";
import SocketContext from "../components/socket_context/context";
import Card from "../components/Card";
import UserText from "../components/UserText";
import Profile from "../components/Profile";
import notifSong from "../data/notification.mp3";
import Message from "../components/Message";
import { animateScroll } from "react-scroll";
import messagesData from "../data/messages.json";

const RoomPage = (props) => {
  const {
    username,
    error,
    newUserMessage,
    newSystemMessage,
    users,
    room,
    usersTyping,
  } = useContext(SocketContext);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState();
  const [messages, setMessages] = useState([]);
  const [usersShow, setUsers] = useState([]);
  const [roomFull, setRoomFull] = useState();
  const [isTyping, setTyping] = useState(false);
  const [typingUsersText, setTypingUsersText] = useState();

  const dong = new UIFx(notifSong);

  useEffect(() => {
    if (!error) {
      async function getData() {
        await getRoom(props.match.params.id);
      }

      getData();
    } else {
      if (error !== undefined) {
        alert("Fatal error from the server :/");
        clearContext(true);
      }
    }

    //When you leave this chat room
    return () => {
      clearContext();
    };
  }, [error]);

  //Fired when room is updated
  useEffect(() => {
    if (room != null) {
      async function getData() {
        await getUser();
        await joinRoom(props.match.params.id);
        await getPersonnesRoom(props.match.params.id);
      }

      getData();

      //When you leave this chat room if it exist
      return () => {
        stopTyping();
        leaveRoom(props.match.params.id);
      };
    }
  }, [room]);

  //When users is loaded
  useEffect(() => {
    if (users !== undefined && room != null) {
      if (roomFull === undefined) {
        setRoomFull(Object.keys(users).length > room.params.max_people);
        if (Object.keys(users).length > room.params.max_people) {
          alert(messagesData.roomFull);
        }
      }

      updateUsers(true);
    }
  }, [users, room]);

  //When username is loaded
  useEffect(() => {
    if (username !== undefined) {
      setLoaded(true);
    }
  }, [username]);

  //When new message is receive
  useEffect(() => {
    if (newUserMessage !== undefined) {
      dong.play();

      setMessages((oldMsgs) => [
        ...oldMsgs,
        <Message username={newUserMessage.username}>
          {newUserMessage.message}
        </Message>,
      ]);
    }
  }, [newUserMessage]);

  //Update users of this chat room
  async function updateData() {
    await getPersonnesRoom(props.match.params.id);
    updateUsers();
  }

  //When new message from the system is receive (join or left)
  useEffect(() => {
    if (newSystemMessage !== undefined) {
      setMessages((oldMsgs) => [
        ...oldMsgs,
        <p className="message message-system">{newSystemMessage}</p>,
      ]);

      updateData();
    }
  }, [newSystemMessage]);

  //When messages is updated we scroll to the bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log("typing updated");
    if (usersTyping !== undefined) {
      console.log(usersTyping);
      let text = "";
      for (const [user, value] of Object.entries(usersTyping)) {
        if (value) {
          //User is actually typing
          if (!text.match(/^$/g)) {
            text += ", ";
          }
          text += user;
        }
      }

      setTypingUsersText(text);
    }
  }, [usersTyping]);

  //When you change the value of your message
  const handleMessage = (e) => {
    const { value } = e.target;
    setMessage(value);

    //Text is empty
    if (value.match(/^$/g)) {
      stopTyping();
    } else {
      if (!isTyping) {
        typing();
      }
    }

    setTyping(!value.match(/^$/g));
  };

  //When you press key on the input text
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      if (!message.match(/^$/g)) {
        sendMessage(props.match.params.id, message);

        setMessages((oldMsgs) => [
          ...oldMsgs,
          <Message username={username} sender={true}>
            {message}
          </Message>,
        ]);
        setMessage("");
        stopTyping();
      }
    }
  }

  //Scroll the scroll bar to bottom
  function scrollToBottom() {
    animateScroll.scrollToBottom({
      containerId: "messages",
    });
  }

  //Redirect if there is any error
  function renderRedirect() {
    if (room === null || roomFull) {
      return <Redirect to="/rooms" />;
    } else {
      if (loaded && (error || username === undefined)) {
        return <Redirect to="/" />;
      }
    }
  }

  //Go through users and generate component
  function updateUsers() {
    if (users !== undefined) {
      let usersItems = [];

      for (const key of Object.keys(users)) {
        usersItems.push(<UserText username={key} />);
      }

      setUsers(usersItems);
    }
  }

  function getMessageTyping() {
    let message = "";
    if (usersTyping !== undefined) {
      let numberUsersTyping = Object.values(usersTyping).filter(Boolean).length;

      if (numberUsersTyping > 0) {
        if (numberUsersTyping > 1) {
          message = messagesData.areTyping;
        } else {
          message = messagesData.isTyping;
        }
      }
    }

    return message;
  }

  return (
    <section id="room">
      {renderRedirect()}
      <h1 className="py-5">
        {messagesData.chatRoomTitle} {room != null ? room.nom : ""}
      </h1>
      <Link to="/rooms">
        <button className="btn btn-dark">{messagesData.backChatRooms}</button>
      </Link>
      <div className="row">
        <div id="chat" className="col-md-9 mb-5">
          <Card
            header={messagesData.chatRoomHeader}
            footer={messagesData.chatRoomFooter}
          >
            <div id="messages">{messages}</div>
            <input
              autocomplete="off"
              type="text"
              placeholder={messagesData.enterMessage}
              value={message}
              onChange={handleMessage}
              onKeyPress={handleKeyPress}
              autoFocus={true}
            />
            <p>
              <b>{typingUsersText}</b> {getMessageTyping()}
            </p>
          </Card>
        </div>

        <div id="sidebar" className="col-md-3 mb-5">
          <Profile username={username} room={props.match.params.id} />

          <Card
            header={messagesData.chatRoomUsersHeader}
            footer={messagesData.chatRoomUsersFooter}
          >
            {usersShow}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default withRouter(RoomPage);
