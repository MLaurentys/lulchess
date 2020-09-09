import React from "react";
import "./App.css";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import NavBar from "./components/Navbar";
import RoomPanel from "./components/RoomPanel";

const client = new W3CWebSocket("ws://127.0.0.1:8000");

class App extends React.Component {
  state = {};

  componentDidMount() {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      console.log(message.data);
    };
  }

  render() {
    return (
      <div className="App">
        <NavBar id="navBar"></NavBar>
        <RoomPanel id="roomPanel"></RoomPanel>
        <span>App</span>
      </div>
    );
  }
}

export default App;
