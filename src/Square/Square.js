import React from "react";
import './Square.css';

// renders a square, using props from the board component
export default class Square extends React.Component {
    render() {
        return <button 
            className={"square" + (this.props.black ? " black" : "") + (this.props.knight ? " knight" : "") + (this.props.goal ? " goal" : "")}
            onClick={() => this.props.sClick([this.props.x, this.props.y])}>
                { this.props.showCoords ? "(" + this.props.x + ", " + this.props.y + ")" : ""}
        </button>
    }
}