import * as fs from "fs";

class Field {
	label: string;
	tuples: [number, number][];
	options: number[];
	index: number;

	constructor(label: string) {
		this.label = label;
		this.tuples = [];
		this.options = [];
		this.index = -1;
	}

	contains(n: number): boolean {
		for (const tuple of this.tuples) {
			if (tuple[0] <= n && n <= tuple[1]) return true;
		}
		return false;
	}
}

class Puzzle {
	fields: Field[];
	my_ticket: number[];
	tickets: number[][];

	constructor(fileName: string) {
		this.fields = [];
		this.my_ticket = [];
		this.tickets = [];
		this.getInput(fileName);
	}

	solvePartOne(): number {
		return this.tickets
			.flat()
			.filter((n) => !this.isValidNumber(n))
			.reduce((sum, n) => sum + n, 0);
	}

	solvePartTwo(): number {
		const validTickets = this.tickets.filter((ticket) => this.isValidTicket(ticket));
		this.setFieldOptions(validTickets);
		this.fields.sort((a, b) => a.options.length - b.options.length);
		this.setFieldIndex();
		return this.fields
			.filter((field) => field.label.includes("departure"))
			.map((field) => this.my_ticket[field.index])
			.reduce((p, n) => p * n, 1);
	}

	private setFieldOptions(tickets: number[][]): void {
		for (const field of this.fields) {
			const options = [];
			for (let i = 0; i < this.my_ticket.length; i++) {
				const numbers = tickets.map((ticket) => ticket[i]);
				if (!numbers.map((n) => field.contains(n)).includes(false)) options.push(i);
			}
			field.options = options;
		}
	}

	private setFieldIndex(fieldIndex: number = 0, matchedIndexes: Set<number> = new Set()): boolean {
		if (fieldIndex === this.fields.length) return true;
		const field = this.fields[fieldIndex];
		for (const index of field.options) {
			if (matchedIndexes.has(index)) continue;
			matchedIndexes.add(index);
			if (this.setFieldIndex(fieldIndex + 1, matchedIndexes)) {
				field.index = index;
				return true;
			}
			matchedIndexes.delete(index);
		}
		return false;
	}

	private isValidTicket(ticket: number[]): boolean {
		for (const n of ticket) {
			if (!this.isValidNumber(n)) return false;
		}
		return true;
	}

	private isValidNumber(n: number): boolean {
		for (const field of this.fields.values()) {
			if (field.contains(n)) return true;
		}
		return false;
	}

	private getInput(fileName: string): void {
		var inputState = 0;

		fs.readFileSync(fileName, { encoding: "utf8", flag: "r" })
			.split(/\r?\n/)
			.forEach((line) => {
				if (line.length === 0) return;
				else if (line.includes("your ticket")) inputState = 1;
				else if (line.includes("nearby tickets")) inputState = 2;
				else {
					switch (inputState) {
						case 0:
							this.getFieldInput(line);
							break;
						case 1:
							this.getTicketInput(line, true);
							break;
						case 2:
							this.getTicketInput(line);
							break;
					}
				}
			});
	}

	private getFieldInput(line: string): void {
		const tupleRegex = /(\d+)-(\d+)/g;
		const data = line.split(":");

		const field = new Field(data[0]);
		for (const tuple of data[1].matchAll(tupleRegex)) {
			field.tuples.push([+tuple[1], +tuple[2]]);
		}
		this.fields.push(field);
	}

	private getTicketInput(line: string, my_ticket: boolean = false): void {
		const data = line.split(",").map(Number);
		if (my_ticket) this.my_ticket = data;
		else this.tickets.push(data);
	}
}

const puzzle = new Puzzle("input.txt");

const resultOne = puzzle.solvePartOne();
console.log(resultOne);

const resultTwo = puzzle.solvePartTwo();
console.log(resultTwo);
