import React from "react";
import { withRouter, Link } from "react-router-dom";
import {
  FaUsers,
} from "react-icons/fa";
import ReactTooltip from "react-tooltip";

const Room = (props) => {
  function getProgressPrc() {
    return (props.users * 100) / props.room.params.max_people;
  }

  function getProgresColor() {
    let prc = getProgressPrc();

    if (prc <= 50) return "bg-success"; //return the class to show it green
    if (prc <= 80) return "bg-warning"; //return the class to show it orange
    return "bg-danger"; //return the class to show it red
  }

  //If chat room is full
  function isFull() {
    return props.users === props.room.params.max_people;
  }

  function getAction() {
        return <Link to={"/room/" + props.id}>{props.room.nom}</Link>;
  }

  return (
    <>
      <div id={props.id} className={"room row " + (isFull() ? "disabled" : "")}>
        <div className="room-header col-6 text-truncate">
          {isFull() ? props.room.nom : getAction()}
        </div>

        <div className="room-body col-3">
          {props.users}/{props.room.params.max_people}{" "}
          <span className="svg">
            <FaUsers />
          </span>
          <div className="progress" style={{ height: 3 + "px" }}>
            <div
              className={"progress-bar " + getProgresColor()}
              role="progressbar"
              style={{ width: getProgressPrc() + "%" }}
              aria-valuenow={props.users}
              aria-valuemin="0"
              aria-valuemax={props.room.params.max_people}
            ></div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <ReactTooltip />
    </>
  );
};

export default withRouter(Room);
