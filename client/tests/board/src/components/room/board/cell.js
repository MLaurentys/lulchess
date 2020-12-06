import React from "react";
import { useDrag, dragPreviewImage } from "react-dnd";
import Piece from "./piece";
import "./cell.css";

const print = console.log;
const spritesPaths = require("../../../constants/constants").spritesPaths;

class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            piece: props.piece,
        };
        this.color = (props.row + props.col) % 2 === 0 ? "black" : "white";
        this.leftOffset = props.col * 12.5;
        this.topOffset = props.row * 12.5;

        this.RenderPiece = this.RenderPiece.bind(this);
    }

    RenderPiece() {
        if (this.state.piece === "") return <></>;
        return (
            <Piece
                pieceName={this.state.piece}
                pieceID={this.props.cellID + "-p"}
            />
        );
    }

    render() {
        return (
            <div
                className="chessSquare"
                style={{
                    backgroundColor: this.color,
                    display: "block",
                    left: this.leftOffset + "%",
                    top: this.topOffset + "%",
                }}
            >
                {this.RenderPiece()}
            </div>
        );
    }
}

export default Cell;
