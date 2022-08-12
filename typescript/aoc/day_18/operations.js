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
class Expression {
    constructor(parent = null) {
        this.items = [];
        this.parent = parent;
    }
    push(item) {
        switch (item) {
            case "(":
                const expression = new this.constructor(this);
                this.items.push(expression);
                return expression;
            case ")":
                return this.parent ? this.parent : this;
            default:
                this.items.push(item);
                return this;
        }
    }
    evaluate() {
        var atomicExpression = [];
        for (const item of this.items) {
            atomicExpression.push(item);
            if (atomicExpression.length === 3) {
                atomicExpression = [this.evaluateAtomic(atomicExpression)];
            }
        }
        return atomicExpression[0];
    }
    evaluateAtomic(items) {
        items = items.map((item) => (item instanceof Expression ? item.evaluate() : item));
        switch (items[1]) {
            case "+":
                return items[0] + items[2];
            case "*":
                return items[0] * items[2];
            default:
                throw new Error("Invalid operation.");
        }
    }
}
class PriorityExpression extends Expression {
    evaluate() {
        const operationOrder = ["+", "*"];
        var remainingItems = [...this.items];
        for (const allowedOperations of operationOrder) {
            remainingItems = this.priorityEvaluate(remainingItems, allowedOperations);
        }
        return remainingItems[0];
    }
    priorityEvaluate(items, allowedOperations) {
        const remainingItems = [];
        var atomicExpression = [];
        for (const item of items) {
            atomicExpression.push(item);
            if (atomicExpression.length === 3) {
                if (allowedOperations.includes(atomicExpression[1])) {
                    atomicExpression = [this.evaluateAtomic(atomicExpression)];
                }
                else {
                    remainingItems.push(atomicExpression.shift());
                    remainingItems.push(atomicExpression.shift());
                }
            }
        }
        remainingItems.push(...atomicExpression);
        return remainingItems;
    }
}
function solve(fileName, solver) {
    return fs
        .readFileSync(fileName, { encoding: "utf8", flag: "r" })
        .split(/\r?\n/)
        .map((line) => evaluateLine(line, solver))
        .reduce((s, v) => s + v, 0);
}
function evaluateLine(line, solver) {
    const tokens = tokenize(line);
    var expression = new solver();
    for (const token of tokens) {
        expression = expression.push(token);
    }
    return expression.evaluate();
}
function tokenize(line) {
    const regex = /(\d+|\S)/g;
    return [...line.matchAll(regex)].map((token) => token[1]).map((token) => (isNaN(+token) ? token : +token));
}
const result = solve("input.txt", Expression);
console.log(result);
const prioResult = solve("input.txt", PriorityExpression);
console.log(prioResult);
