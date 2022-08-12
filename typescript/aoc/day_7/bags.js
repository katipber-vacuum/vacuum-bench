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
class Edge {
    constructor(node, weight) {
        this.node = node;
        this.weight = weight;
    }
}
class Node {
    constructor(label) {
        this.label = label;
        this.parents = [];
        this.children = [];
    }
}
class Puzzle {
    constructor(fileName) {
        this.graph = new Map();
        this.getInput(fileName);
    }
    solvePartOne(label) {
        return this.countContainingParents(this.graph.get(label));
    }
    solvePartTwo(label) {
        return this.countAllChildren(this.graph.get(label)) - 1;
    }
    countContainingParents(node, parents = new Set()) {
        node.parents
            .filter((edge) => !parents.has(edge.node))
            .forEach((edge) => {
            parents.add(edge.node);
            this.countContainingParents(edge.node, parents);
        });
        return parents.size;
    }
    countAllChildren(node) {
        var sum = 1;
        node.children.forEach((edge) => {
            sum += edge.weight * this.countAllChildren(edge.node);
        });
        return sum;
    }
    getInput(fileName) {
        fs.readFileSync(fileName, { encoding: "utf8", flag: "r" })
            .split(/\r?\n/)
            .forEach((line) => {
            const data = line.split(" contain ");
            const parent = this.getParent(data[0]);
            this.updateGraph(parent, data[1]);
        });
    }
    getParent(rawData) {
        const regex = /([\D]+) bags?/;
        return this.getOrCreateNode(rawData.match(regex)[1]);
    }
    updateGraph(parent, rawChildData) {
        const regex = /(\d+) ([^\d]+) bags?/g;
        for (const data of rawChildData.matchAll(regex)) {
            const weight = +data[1];
            const child = this.getOrCreateNode(data[2]);
            parent.children.push(new Edge(child, weight));
            child.parents.push(new Edge(parent, weight));
        }
    }
    getOrCreateNode(label) {
        if (this.graph.has(label))
            return this.graph.get(label);
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
