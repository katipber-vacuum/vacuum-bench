import * as fs from "fs";

type Id = string;
type Point = {
	x: number;
	y: number;
};
type Range = {
	beg: number;
	end: number;
};

enum Water {
	none,
	semi,
	full,
}

const directions: { [key: string]: Point } = {
	bottom: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
};

class Simulation {
	map: Map<Id, Ground> = new Map();
	scanRange: Range;

	constructor(fileName: string) {
		this.map = new Map();
		this.scanRange = { beg: Infinity, end: 0 };
		this.initialize(fileName);
	}

	run(): void {
		const spring = new Spring({ x: 500, y: 0 });
		this.map.set(JSON.stringify(spring.point), spring);
		spring.simulate(this);
	}

	getWater(full: boolean = false): number {
		const allowedWater = full ? [Water.full] : [Water.full, Water.semi];
		return [...this.map.values()].filter(
			(ground) => allowedWater.includes(ground.water) && ground.point.y >= this.scanRange.beg
		).length;
	}

	getGround(root: Ground, direction: Point): Ground {
		const point = { x: root.point.x + direction.x, y: root.point.y + direction.y };
		if (point.y > this.scanRange.end) return new Border(point);

		const id = JSON.stringify(point);
		if (this.map.has(id)) return this.map.get(id)!;

		const ground = new Sand(point);
		this.map.set(id, ground);
		return ground;
	}

	show(): void {
		let minx = 500;
		let maxx = 500;
		let miny = 0;
		let maxy = 0;

		this.map.forEach((ground) => {
			minx = ground.point.x < minx ? ground.point.x : minx;
			maxx = ground.point.x > maxx ? ground.point.x : maxx;
			miny = ground.point.y < miny ? ground.point.y : miny;
			maxy = ground.point.y > maxy ? ground.point.y : maxy;
		});

		for (let y = miny; y <= maxy; y++) {
			for (let x = minx; x <= maxx; x++) {
				let id = JSON.stringify({ x: x, y: y });
				if (this.map.has(id)) this.map.get(id)!.show();
				else process.stdout.write(".");
			}
			console.log();
		}
		console.log();
	}

	private initialize(fileName: string): void {
		const regex = /(x|y)=(\d+).*(x|y)=(\d+)\.\.(\d+)/g;
		fs.readFileSync(fileName, { encoding: "utf8", flag: "r" })
			.split(/\r?\n/)
			.map((line) =>
				[...line.matchAll(regex)].forEach((token) => {
					for (let i = +token[4]; i <= +token[5]; i++) {
						let ground: Ground;
						if (token[1] == "x") ground = new Clay({ x: +token[2], y: i });
						else ground = new Clay({ x: i, y: +token[2] });
						this.map.set(JSON.stringify(ground.point), ground);
					}
				})
			);
		this.map.forEach((ground) => {
			this.scanRange.beg = Math.min(this.scanRange.beg, ground.point.y);
			this.scanRange.end = Math.max(this.scanRange.end, ground.point.y);
		});
	}
}

abstract class Ground {
	water: Water = Water.none;
	neighbors: Ground[] = [];

	constructor(readonly point: Point) {}

	simulate(simulation: Simulation, allowedDirections: Point[] = []): void {}

	level(): void {}

	show(): void {}
}

class Spring extends Ground {
	simulate(simulation: Simulation, allowedDirections: Point[] = []): void {
		simulation.getGround(this, directions.bottom).simulate(simulation, [directions.left, directions.rigth]);
	}

	show(): void {
		process.stdout.write("+");
	}
}

class Border extends Ground {
	water = Water.semi;
}

class Clay extends Ground {
	show(): void {
		this.water == Water.none ? process.stdout.write("#") : process.stdout.write("!");
	}
}

class Sand extends Ground {
	simulate(simulation: Simulation, allowedDirections: Point[] = []): void {
		if (this.water != Water.none) return;

		const bottom = simulation.getGround(this, directions.bottom);
		bottom.simulate(simulation, [directions.left, directions.right]);
		if (bottom.water == Water.semi) {
			this.water = Water.semi;
			return;
		}

		allowedDirections.forEach((direction) => {
			const neighbor = simulation.getGround(this, direction);
			neighbor.simulate(simulation, [direction]);
			this.neighbors.push(neighbor);
		});

		if (this.neighbors.map((neighbor) => neighbor.water).includes(Water.semi)) this.level();
		else this.water = Water.full;
	}

	level(): void {
		this.water = Water.semi;
		this.neighbors.forEach((neighbor) => {
			if (neighbor.water == Water.full) neighbor.level();
		});
	}

	show(): void {
		switch (this.water) {
			case Water.none:
				process.stdout.write(".");
				break;
			case Water.semi:
				process.stdout.write("|");
				break;
			case Water.full:
				process.stdout.write("~");
				break;
		}
	}
}

const simulation = new Simulation("input.txt");
simulation.run();
console.log(simulation.getWater());
console.log(simulation.getWater(true));
