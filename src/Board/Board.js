import React from "react";
import Square from "../Square/Square";
import './Board.css';

/* receives props for game state and renders the board accordingly */
export default class Board extends React.Component {

    // renders a single square
    renderSquare(x, y) {
        // gives a sequential square number starting from top left (1) up to bottom right (64)
        var key = (y + 1) * 8 + x;

        // square shading...
        // odd squares are white, evens are black
        var black = false;
        if(key % 2 === 0) black = true;
        // swap on every other row (i.e. every multiple of 16)
        if((key - x) % 16 !== 0) black = !black;

        // check pos for knight and goal
        var knight  = this.props.knight && this.props.knight[0] === x && this.props.knight[1] === y;
        var goal = this.props.goal && this.props.goal[0] === x && this.props.goal[1] === y;

        // create the square
        return  <Square 
                    key={key} 
                    y={y} 
                    x={x}
                    black={black}
                    knight={knight} 
                    goal={goal}
                    sClick={this.props.bClick}
                    showCoords={this.props.showCoords}
                >
                </Square>;
    }

    // renders the game board
    render() {
        const board = [];
        for(let y = 0; y < 8; ++y) {
            const boardRows = [];
            for(let x = 0; x < 8; ++x) {
                boardRows.push(this.renderSquare(x, y));
            }
            board.push(<div className="board-row" key={y}>{boardRows}</div>);
        }
        return (
            <div className="board">
                {board}
            </div>
        );
    }
}