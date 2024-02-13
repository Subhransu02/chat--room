import React, { useState, useEffect, useContext } from "react";
import { withRouter, Redirect } from "react-router-dom";
import {
  getUser,
  getNbPersonnes,
  getNbPersonnesRooms,
  getRooms,
  clearContext,
} from "../sockets/emit";
import SocketContext from "../components/socket_context/context";
import Card from "../components/Card";
import messages from "../data/messages.json";
import Room from "../components/Room";
import Profile from "../components/Profile";

const RoomsPage = (props) => {
  const { nbPersonnes, username, error, roomsPers, rooms } =
    useContext(SocketContext);
  const [loaded, setLoaded] = useState(false);
  const [roomsComponent, setRoomsComponent] = useState([]);

  useEffect(() => {
    if (!error) {
      async function getData() {
        await getUser();
        await getRooms();
        await getNbPersonnes();
        await getNbPersonnesRooms();
      }

      getData();
    } else {
      if (error !== undefined) {
        alert("Fatal error from the server :/");
        clearContext(true);
      }
    }
  }, [error]);

  useEffect(() => {
    if (username !== undefined) {
      setLoaded(true);
    }
  }, [username]);

  useEffect(() => {
    if (rooms != undefined) {
      updateRooms(true);
    }
  }, [rooms]);

  useEffect(() => {
    if (roomsPers !== undefined) {
      updateRooms(true);
    }
  }, [roomsPers]);

  function renderRedirect() {
    if (loaded && (error || username === undefined)) {
      return <Redirect to="/" />;
    }
  }

  //Generate rooms component
  function updateRooms() {
    if (rooms !== undefined) {
      let roomsItems = [];
      for (const [key, value] of Object.entries(rooms)) {
        roomsItems.push(
          <Room
            id={key}
            room={value}
            users={
              roomsPers !== undefined && roomsPers[key] !== undefined
                ? roomsPers[key]
                : 0
            }
          />
        );
      }

      setRoomsComponent(roomsItems);
    }
  }

  return (
    <section id="rooms">
      {renderRedirect()}
      <h1 className="py-5">{messages.roomsTitle}</h1>
      <div className="row">
        <div id="all-rooms" className="col-md-9 mb-5">
          <Card header={messages.roomsHeader} footer={messages.roomsFooter}>
            {roomsComponent}
          </Card>
        </div>

        <div id="sidebar" className="col-md-3 mb-5">
          <Profile username={username} />

          <div id="infos">
            <Card header={messages.infosHeader} footer={messages.infosFooter}>
              <p>
                {nbPersonnes} {messages.connected}
                {nbPersonnes > 1 ? "s" : ""}.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default withRouter(RoomsPage);
