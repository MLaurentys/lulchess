import React from "react";
import { useDrag, dragPreviewImage, DragPreviewImage } from "react-dnd";

import "./piece.css";

const print = console.log;
const spritesPaths = require("../../../constants/constants").spritesPaths;

export default function Piece({ pieceName: pieceName, pieceID: pieceID }) {
    const [{ isDragging }, dragConnector, previewConnector] = useDrag({
        item: { type: "piece", id: pieceID },
        collect: (monitor) => {
            return {
                isDragging: !!monitor.isDragging(),
                previewOptions: { backgroundColor: "purple" },
            };
        },
    });
    return (
        <>
            <DragPreviewImage
                className="piece"
                connect={previewConnector}
                src={spritesPaths[pieceName]}
            />
            <div ref={dragConnector} style={{ opacity: isDragging ? 0 : 1 }}>
                <img
                    className="piece"
                    src={spritesPaths[pieceName]}
                    alt={pieceName}
                />
            </div>
        </>
    );
}
