import * as fs from "fs";

type Item = number | string | Expression;

class Expression {
	parent: Expression | null;
	items: Item[] = [];

	constructor(parent: Expression | null = null) {
		this.parent = parent;
	}

	push(item: Item): Expression {
		switch (item) {
			case "(":
				const expression = new (<any>this.constructor)(this);
				this.items.push(expression);
				return expression;
			case ")":
				return this.parent ? this.parent : this;
			default:
				this.items.push(item);
				return this;
		}
	}

	evaluate(): number {
		var atomicExpression: Item[] = [];
		for (const item of this.items) {
			atomicExpression.push(item);
			if (atomicExpression.length === 3) {
				atomicExpression = [this.evaluateAtomic(atomicExpression)];
			}
		}
		return <number>atomicExpression[0];
	}

	protected evaluateAtomic(items: Item[]): number {
		items = items.map((item) => (item instanceof Expression ? item.evaluate() : item));
		switch (items[1]) {
			case "+":
				return <number>items[0] + <number>items[2];
			case "*":
				return <number>items[0] * <number>items[2];
			default:
				throw new Error("Invalid operation.");
		}
	}
}

class PriorityExpression extends Expression {
	evaluate(): number {
		const operationOrder = ["+", "*"];
		var remainingItems: Item[] = [...this.items];
		for (const allowedOperations of operationOrder) {
			remainingItems = this.priorityEvaluate(remainingItems, allowedOperations);
		}
		return <number>remainingItems[0];
	}

	private priorityEvaluate(items: Item[], allowedOperations: string): Item[] {
		const remainingItems: Item[] = [];
		var atomicExpression: Item[] = [];
		for (const item of items) {
			atomicExpression.push(item);
			if (atomicExpression.length === 3) {
				if (allowedOperations.includes(<string>atomicExpression[1])) {
					atomicExpression = [this.evaluateAtomic(atomicExpression)];
				} else {
					remainingItems.push(atomicExpression.shift()!);
					remainingItems.push(atomicExpression.shift()!);
				}
			}
		}
		remainingItems.push(...atomicExpression);
		return remainingItems;
	}
}

function solve(fileName: string, solver: typeof Expression): number {
	return fs
		.readFileSync(fileName, { encoding: "utf8", flag: "r" })
		.split(/\r?\n/)
		.map((line) => evaluateLine(line, solver))
		.reduce((s, v) => s + v, 0);
}

function evaluateLine(line: string, solver: typeof Expression): number {
	const tokens = tokenize(line);
	var expression = new solver();
	for (const token of tokens) {
		expression = expression.push(token);
	}
	return expression.evaluate();
}

function tokenize(line: string): Item[] {
	const regex = /(\d+|\S)/g;
	return [...line.matchAll(regex)].map((token) => token[1]).map((token) => (isNaN(+token) ? token : +token));
}

const result = solve("input.txt", Expression);
console.log(result);

const prioResult = solve("input.txt", PriorityExpression);
console.log(prioResult);
