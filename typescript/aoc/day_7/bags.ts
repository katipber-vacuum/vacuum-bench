import * as fs from "fs";

class Edge {
	node: Node;
	weight: number;

	constructor(node: Node, weight: number) {
		this.node = node;
		this.weight = weight;
	}
}

class Node {
	label: string;
	parents: Edge[];
	children: Edge[];

	constructor(label: string) {
		this.label = label;
		this.parents = [];
		this.children = [];
	}
}

class Puzzle {
	private readonly graph: Map<string, Node>;

	constructor(fileName: string) {
		this.graph = new Map();
		this.getInput(fileName);
	}

	solvePartOne(label: string): number {
		return this.countContainingParents(this.graph.get(label)!);
	}

	solvePartTwo(label: string): number {
		return this.countAllChildren(this.graph.get(label)!) - 1;
	}

	private countContainingParents(node: Node, parents: Set<Node> = new Set()): number {
		node.parents
			.filter((edge) => !parents.has(edge.node))
			.forEach((edge) => {
				parents.add(edge.node);
				this.countContainingParents(edge.node, parents);
			});
		return parents.size;
	}

	private countAllChildren(node: Node): number {
		var sum = 1;
		node.children.forEach((edge) => {
			sum += edge.weight * this.countAllChildren(edge.node);
		});
		return sum;
	}

	private getInput(fileName: string): void {
		fs.readFileSync(fileName, { encoding: "utf8", flag: "r" })
			.split(/\r?\n/)
			.forEach((line) => {
				const data = line.split(" contain ");
				const parent = this.getParent(data[0]);
				this.updateGraph(parent, data[1]);
			});
	}

	private getParent(rawData: string): Node {
		const regex = /([\D]+) bags?/;
		return this.getOrCreateNode(rawData.match(regex)![1]);
	}

	private updateGraph(parent: Node, rawChildData: string): void {
		const regex = /(\d+) ([^\d]+) bags?/g;

		for (const data of rawChildData.matchAll(regex)) {
			const weight = +data[1];
			const child = this.getOrCreateNode(data[2]);
			parent.children.push(new Edge(child, weight));
			child.parents.push(new Edge(parent, weight));
		}
	}

	private getOrCreateNode(label: string): Node {
		if (this.graph.has(label)) return this.graph.get(label)!;
		const node = new Node(label);
		this.graph.set(label, node);
		return node;
	}
}

const puzzle = new Puzzle("input.txt");

const resultOne = puzzle.solvePartOne("shiny gold");
console.log(resultOne);

const resultTwo = puzzle.solvePartTwo("shiny gold");
console.log(resultTwo);
