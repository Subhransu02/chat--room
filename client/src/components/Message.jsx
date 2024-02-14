import React from "react";
const Message = (props) => {
  if (props.sender) {
    return (
      <>
        <div class="message message-sender">{props.children}</div>
        <div class="clearfix"></div>
      </>
    );
  } else {
    return (
      <div class="row">
        <div class="col-md-1 col-2">
          <img
            className="img-fluid message-logo"
            src={ process.env.BASE_URL + props.username}
            alt="Logo"
          />
        </div>

        <div class="col-md-11 col-10 message message-getter">
          <b>{props.username} :</b> {props.children}
        </div>
      </div>
    );
  }
};

export default Message;
