import React from "react";
import { withRouter, Redirect } from "react-router-dom";
import messages from "../data/messages.json";
import { addUser } from "../sockets/emit";

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.updateUsername = this.updateUsername.bind(this);
    this.checkUsername = this.checkUsername.bind(this);
    this.state = {
      username: "",
      error: true,
      message: "",
      redirect: false,
    };
  }

  checkUsername() {
    if (!this.state.error) {
      this.setState({ redirect: true });
      addUser(this.state.username);
    }
  }

  updateUsername(event) {
    let value = event.target.value;
    let message = "";

    let emptyRegex = /^$/g;
    let formatUsername = /^([\w|-]+)$/g;
    if (value.match(emptyRegex)) {
      message = messages.fieldEmpty;
    } else {
      if (value.length > event.target.maxLength) {
        message = messages.usernameTooLong;
      } else {
        if (!value.match(formatUsername)) {
          message = messages.usernameFormatInvalid;
        }
      }
    }

    this.setState({
      username: value,
      error: !message.match(emptyRegex),
      message: message,
    });
  }

  handleKeyPress = (event) => {
    if (event.key === "Enter") {
      this.checkUsername();
    }
  };

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to="/rooms" />;
    }
  };

  render() {
    return (
      <section id="home">
        {this.renderRedirect()}
        <div className="header">
          <img src="./logo.png" alt="logo" />
        </div>
        <div id="login" className="mt-5">
          <div className="form-group col-lg-4 col-md-6 m-auto">
            <label htmlFor="username">{messages.username} :</label>
            <input
              autocomplete="off"
              type="text"
              id="username"
              name="username"
              maxLength="30"
              className="form-control"
              required
              value={this.state.username}
              onChange={this.updateUsername}
              onKeyPress={this.handleKeyPress}
              autoFocus={true}
            />
            <p id="error-username" className="text-danger font-italic">
              {this.state.message}
            </p>
          </div>

          <div className="col-lg-4 col-md-6 m-auto">
            <input
              id="login"
              type="submit"
              className="btn btn-primary w-100"
              value={messages.login}
              onClick={this.checkUsername}
            />
          </div>
        </div>
      </section>
    );
  }
}

export default withRouter(HomePage);
