import * as fs from "fs";

type Id = string;
type Tile = Point;
type Direction = Point;
type DirectionKey = keyof typeof directions;

class Point {
	readonly id: Id;
	readonly x: number;
	readonly y: number;

	constructor(id: Id);
	constructor(x: number, y: number);

	constructor(arg1: Id | number, arg2?: number) {
		if (arg2 !== undefined) {
			this.x = arg1 as number;
			this.y = arg2;
			this.id = `${this.x},${this.y}`;
		} else {
			const xy = (arg1 as string).split(",").map((arg) => +arg);
			this.x = xy[0];
			this.y = xy[1];
			this.id = arg1 as string;
		}
	}

	move(direction: Direction): Point {
		return new Point(this.x + direction.x, this.y + direction.y);
	}

	neighbors(): Point[] {
		return Object.keys(directions)
			.map((key) => directions[key as DirectionKey])
			.map((direction) => this.move(direction));
	}
}

class Lobby {
	readonly tiles: Map<Id, Tile> = new Map();

	findTile(directions: Direction[]): Tile {
		var point = new Point(0, 0);
		directions.forEach((direction) => (point = point.move(direction)));
		return point;
	}

	flipTile(tile: Tile): void {
		if (this.tiles.has(tile.id)) this.tiles.delete(tile.id);
		else this.tiles.set(tile.id, tile);
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

function parseInput(fileName: string): Direction[][] {
	const regex = /(e|se|sw|w|nw|ne)/g;
	return fs
		.readFileSync(fileName, { encoding: "utf8", flag: "r" })
		.split(/\r?\n/)
		.map((line) => [...line.matchAll(regex)].map((label) => directions[label[1] as DirectionKey]));
}

function setLobby(fileName: string) {
	const lobby = new Lobby();
	parseInput(fileName).forEach((directions) => lobby.flipTile(lobby.findTile(directions)));
	return lobby;
}

function getNeighborCount(neighbors: Point[]): Map<Id, number> {
	const count: Map<Id, number> = new Map();
	for (const point of neighbors) {
		if (!count.has(point.id)) count.set(point.id, 0);
		count.set(point.id, count.get(point.id)! + 1);
	}
	return count;
}

function solvePartOne(fileName: string): number {
	const lobby = setLobby(fileName);
	return lobby.tiles.size;
}

function solvePartTwo(fileName: string, days: number = 100): number {
	const lobby = setLobby(fileName);

	for (let i = 0; i < days; i++) {
		const tilesToFlip: Tile[] = [];
		const neighbors = [...lobby.tiles.values()].map((tile) => tile.neighbors()).flat();
		const neighborCount = getNeighborCount(neighbors);

		// Black tiles to be flipped
		lobby.tiles.forEach((tile: Tile) => {
			if (!neighborCount.has(tile.id) || neighborCount.get(tile.id)! > 2) tilesToFlip.push(tile);
			neighborCount.delete(tile.id);
		});
		// White tiles to be flipped
		neighborCount.forEach((count: number, id: Id) => {
			if (count === 2) tilesToFlip.push(new Point(id));
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
