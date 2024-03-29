import React from "react";

import "./match.css";

import Board from "./board/board";
import Clock from "./clock/clock";
const baseBoard = require("../../constants/constants").baseBoard;

class Match extends React.Component {
    constructor(props) {
        super(props);
        let brd = [];
        baseBoard.forEach((row) => {
            let r = [];
            row.forEach((piece) => r.push(piece));
            brd.push(r);
        });
        this.state = {
            boardState: brd,
        };
        this.SetServerCallback = props.SetServerCallback;
    }

    render() {
        return (
            <div id="match">
                <Board
                    BroadcastMove={this.props.BroadcastMove}
                    SetServerCallback={this.SetServerCallback}
                    ID="board"
                    board={this.state.boardState}
                />
                <div id="clocks">
                    <Clock ID="opponentClock" />
                    <Clock ID="ownClock" />
                </div>
            </div>
        );
    }
}

export default Match;
