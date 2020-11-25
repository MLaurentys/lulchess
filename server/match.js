/*
 * This file defines and implements the Match class.
 * The Match keeps track of a match game state, validates moves, regulates
 *  the clock and declares winners.
 */

const matchParamsList = require("./constants").createMatchFields;

const print = console.log;

class Match {
    constructor(matchEmitter, matchParams) {
        this.matchEmitter = matchEmitter;
        this.params = matchParams;

        print("Match criada");
    }
}

module.exports = Match;