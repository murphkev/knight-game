import React from "react";
import Board from "../Board/Board";
import './Game.css';

/* handles all the game logic and state */
export default class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            knight: null,
            goal: null,
            over: true,
            messages: [],
            showCoords: false
        };

        // binding so this will work from child component event
        this.gClick = this.gClick.bind(this);
    }

    // resets the game state to the default
    newGame() {
        var startPositions = this.getStartingPositions();
        this.setState({
            knight: startPositions[0],
            goal: startPositions[1],
            over: false,
            messages: []
        }, () => { this.postMessage("New game started"); });
    }

    // moves the knight one move toward the end location along the shortest path possible
    help() {
        if(this.state.over) {
            this.postMessage("Please start a new game");
        }
        else {
            let path = this.getShortestPath();
            this.moveKnight(path.shift());
        }
    }

    // gets the shortest path to the goal
    // mostly learnt /adapted from https://www.geeksforgeeks.org/minimum-steps-reach-target-knight/
    getShortestPath() {
        // for brevity's sake
        let pos = this.state.knight;
        let target = this.state.goal;

        // all possible moves relative to current pos
        let deltaX = [-2, -1,  1,  2, -2, -1, 1, 2];
        let deltaY = [-1, -2, -2, -1,  1,  2, 2, 1];

        // queue of moves including move history
        let queue = [];
        queue.push([pos, []]);

        // boolean version of chess board to check visited squares
        // so that we don't revisit the same square and end up in
        // an infinite loop
        let visited = new Array(8);
        for(let i = 0; i < visited.length; ++i) {
            visited[i] = new Array(8);
            for(let j = 0; j < visited[i].length; ++j) {
                visited[i][j] = false;
            }
        }

        // mark the current knight pos as visited
        visited[pos[0]][pos[1]] = true;

        // vars for the new position
        let nPos, x, y;

        // loop until there is one element in queue
        while (queue.length !== 0) {

            // get the first pos
            /* 
                NB: because positions are added in order of 
                lowest to greatest 'distance' to target,
                we don't need to sort the array, or compare the 
                distance of moves; the first element will always
                have the lowest, or equal lowest move count.
            */
            nPos = queue.shift();

            // if that's the target...
            if (this.isSameSquare(nPos[0], target)) {
                return nPos[1];
            }

            // otherwise check every other move possible
            for (let i = 0; i < 8; ++i) {
                x = nPos[0][0] + deltaX[i];
                y = nPos[0][1] + deltaY[i];

                // make sure those squares are valid, and not previously visited
                if (this.isValidSquare([x, y]) && !visited[x][y]) {
                    // mark square as visited
                    visited[x][y] = true;
                    let history = [...nPos[1], [x, y]];
                    queue.push([[x, y], history]);
                }
            }
        }

        // unsolvable, which should be impossible
        return [];
    }

    // checks to see if a square is valid for the board
    isValidSquare(pos) {
        return pos && 
            Array.isArray(pos) && 
            pos[0] >= 0 && 
            pos[0] <= 7 && 
            pos[1] >= 0 && 
            pos[1] <= 7;
    }

    // draws the game UI
    render() {
        return <div id="game-container">
            <div id="game">
                <Board knight={this.state.knight} goal={this.state.goal} showCoords={this.state.showCoords} bClick={this.gClick}></Board>
                <div id="nav">
                    <button id="start-btn" onClick={() => this.newGame()}>Start Game</button>
                    <button id="help-btn" onClick={() => this.help()}>Help</button>
                    <button id="coords-btn" onClick={() => this.toggleCoords()}>Toggle Coords</button>
                </div>
                <div id="message-bar">
                    {this.renderMessages()}
                </div>
            </div>
        </div>
    }

    // hide/show x,y coords on squares
    toggleCoords() {
        this.setState({ showCoords: !this.state.showCoords });
    }

    // adds a message to messages queue
    postMessage(msg) {
        this.setState({messages: [...this.state.messages, msg]});
    }

    // renders the message queue
    renderMessages() {
        const messages = [];
        for(let i = this.state.messages.length - 1; i >= 0; --i) {
            messages.push(<span key={i} id={i} className="message">{this.state.messages[i]}</span>)    
        }
        return messages;
    }

    // on-click for squares
    gClick(pos) {
        if(!this.state.over) {
            this.moveKnight(pos);
        }
    }

    // moves the knight to a new position, checking validity
    moveKnight(pos) {
        // if the move was valid
        if(this.isValidMove(pos)) {
            // update the state, and check the win conditions in the callback
            this.setState({
                knight: pos
            }, () => {
                this.postMessage("Moved to (" + (pos[0]) + ", " + (pos[1]) + ")");
                this.isOver();
            });
        }
        else {
            // otherwise the move must be invalid
            this.postMessage("Invalid move");
        }       
    }

    // check if a knight move is valid
    isValidMove(pos) {
        var rowDiff = Math.abs(this.state.knight[0] - pos[0]);
        var colDiff = Math.abs(this.state.knight[1] - pos[1]);

        // total diff must be 3 with neither one 0
        if(rowDiff + colDiff === 3 && rowDiff > 0 && colDiff > 0)
            return true;
        else return false;
    }

    // checks to see if two positions are the same
    isSameSquare(pos1, pos2) {
        return pos1[0] === pos2[0] && pos1[1] === pos2[1]; 
    }

    // checks if the game is over
    isOver() {
        if(this.isSameSquare(this.state.knight, this.state.goal)) {
            this.setState({
                over: true
            }, () => {
                this.postMessage("Congratulations! You Win!");
            });
        }
    }

    // gets two random starting positions that are not the same position
    getStartingPositions() {
        var pos1 = this.getRandomSquare();
        var pos2 = this.getRandomSquare();

        while(this.isSameSquare(pos1, pos2)) {
            pos2 = this.getRandomSquare();
        }
        return [pos1, pos2]
    }

    // gets a random position
    getRandomSquare() {
        return [Math.floor(Math.random() * 7), Math.floor(Math.random() * 7)]
    }
}