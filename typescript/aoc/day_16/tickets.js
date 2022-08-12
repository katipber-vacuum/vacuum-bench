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
class Field {
    constructor(label) {
        this.label = label;
        this.tuples = [];
        this.options = [];
        this.index = -1;
    }
    contains(n) {
        for (const tuple of this.tuples) {
            if (tuple[0] <= n && n <= tuple[1])
                return true;
        }
        return false;
    }
}
class Puzzle {
    constructor(fileName) {
        this.fields = [];
        this.my_ticket = [];
        this.tickets = [];
        this.getInput(fileName);
    }
    solvePartOne() {
        return this.tickets
            .flat()
            .filter((n) => !this.isValidNumber(n))
            .reduce((sum, n) => sum + n, 0);
    }
    solvePartTwo() {
        const validTickets = this.tickets.filter((ticket) => this.isValidTicket(ticket));
        this.setFieldOptions(validTickets);
        this.fields.sort((a, b) => a.options.length - b.options.length);
        this.setFieldIndex();
        return this.fields
            .filter((field) => field.label.includes("departure"))
            .map((field) => this.my_ticket[field.index])
            .reduce((p, n) => p * n, 1);
    }
    setFieldOptions(tickets) {
        for (const field of this.fields) {
            const options = [];
            for (let i = 0; i < this.my_ticket.length; i++) {
                const numbers = tickets.map((ticket) => ticket[i]);
                if (!numbers.map((n) => field.contains(n)).includes(false))
                    options.push(i);
            }
            field.options = options;
        }
    }
    setFieldIndex(fieldIndex = 0, matchedIndexes = new Set()) {
        if (fieldIndex === this.fields.length)
            return true;
        const field = this.fields[fieldIndex];
        for (const index of field.options) {
            if (matchedIndexes.has(index))
                continue;
            matchedIndexes.add(index);
            if (this.setFieldIndex(fieldIndex + 1, matchedIndexes)) {
                field.index = index;
                return true;
            }
            matchedIndexes.delete(index);
        }
        return false;
    }
    isValidTicket(ticket) {
        for (const n of ticket) {
            if (!this.isValidNumber(n))
                return false;
        }
        return true;
    }
    isValidNumber(n) {
        for (const field of this.fields.values()) {
            if (field.contains(n))
                return true;
        }
        return false;
    }
    getInput(fileName) {
        var inputState = 0;
        fs.readFileSync(fileName, { encoding: "utf8", flag: "r" })
            .split(/\r?\n/)
            .forEach((line) => {
            if (line.length === 0)
                return;
            else if (line.includes("your ticket"))
                inputState = 1;
            else if (line.includes("nearby tickets"))
                inputState = 2;
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
    getFieldInput(line) {
        const tupleRegex = /(\d+)-(\d+)/g;
        const data = line.split(":");
        const field = new Field(data[0]);
        for (const tuple of data[1].matchAll(tupleRegex)) {
            field.tuples.push([+tuple[1], +tuple[2]]);
        }
        this.fields.push(field);
    }
    getTicketInput(line, my_ticket = false) {
        const data = line.split(",").map(Number);
        if (my_ticket)
            this.my_ticket = data;
        else
            this.tickets.push(data);
    }
}
const puzzle = new Puzzle("input.txt");
const resultOne = puzzle.solvePartOne();
console.log(resultOne);
const resultTwo = puzzle.solvePartTwo();
console.log(resultTwo);
