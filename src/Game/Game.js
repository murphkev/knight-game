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
            fetch(`https://glacial-savannah-02062.herokuapp.com/knight?x=${this.state.knight[0]}&y=${this.state.knight[1]}&tx=${this.state.goal[0]}&ty=${this.state.goal[1]}`, 
                { method: 'GET' })
                .then(res => res.json())
                .then(data => {
                        this.moveKnight(data.path.shift());
                });           
        }
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