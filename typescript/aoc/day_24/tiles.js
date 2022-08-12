"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Point {
    constructor(arg1, arg2) {
        if (arg2 !== undefined) {
            this.x = arg1;
            this.y = arg2;
            this.id = `${this.x},${this.y}`;
        }
        else {
            const xy = arg1.split(",").map((arg) => +arg);
            this.x = xy[0];
            this.y = xy[1];
            this.id = arg1;
        }
    }
    move(direction) {
        return new Point(this.x + direction.x, this.y + direction.y);
    }
    neighbors() {
        return Object.keys(directions)
            .map((key) => directions[key])
            .map((direction) => this.move(direction));
    }
}
class Lobby {
    constructor() {
        this.tiles = new Map();
    }
    findTile(directions) {
        var point = new Point(0, 0);
        directions.forEach((direction) => (point = point.move(direction)));
        return point;
    }
    flipTile(tile) {
        if (this.tiles.has(tile.id))
            this.tiles.delete(tile.id);
        else
            this.tiles.set(tile.id, tile);
    }
}
const directions = {
    e: new Point(2, 0),
    ne: new Point(1, 1),
    se: new Point(1, -1),
    w: new Point(-2, 0),
    nw: new Point(-1, 1),
    sw: new Point(-1, -1),
};
function parseInput(fileName) {
    const regex = /(e|se|sw|w|nw|ne)/g;
    return fs
        .readFileSync(fileName, { encoding: "utf8", flag: "r" })
        .split(/\r?\n/)
        .map((line) => [...line.matchAll(regex)].map((label) => directions[label[1]]));
}
function setLobby(fileName) {
    const lobby = new Lobby();
    parseInput(fileName).forEach((directions) => lobby.flipTile(lobby.findTile(directions)));
    return lobby;
}
function getNeighborCount(neighbors) {
    const count = new Map();
    for (const point of neighbors) {
        if (!count.has(point.id))
            count.set(point.id, 0);
        count.set(point.id, count.get(point.id) + 1);
    }
    return count;
}
function solvePartOne(fileName) {
    const lobby = setLobby(fileName);
    return lobby.tiles.size;
}
function solvePartTwo(fileName, days = 100) {
    const lobby = setLobby(fileName);
    for (let i = 0; i < days; i++) {
        const tilesToFlip = [];
        const neighbors = [...lobby.tiles.values()].map((tile) => tile.neighbors()).flat();
        const neighborCount = getNeighborCount(neighbors);
        // Black tiles to be flipped
        lobby.tiles.forEach((tile) => {
            if (!neighborCount.has(tile.id) || neighborCount.get(tile.id) > 2)
                tilesToFlip.push(tile);
            neighborCount.delete(tile.id);
        });
        // White tiles to be flipped
        neighborCount.forEach((count, id) => {
            if (count === 2)
                tilesToFlip.push(new Point(id));
        });
        // Flip tiles
        tilesToFlip.forEach((tile) => lobby.flipTile(tile));
    }
    return lobby.tiles.size;
}
const solutionPartOne = solvePartOne("input.txt");
console.log(solutionPartOne);
const solutionPartTwo = solvePartTwo("input.txt");
console.log(solutionPartTwo);
