const EventEmitter = require("events");
const { release } = require("os");
var ReadWriteLock = require("rwlock");
const { setTimeout } = require("timers");

const MatchManager = require("./match_manager");
const Room = require("./room");
const createErrors = require("./constants").createRoomErrors;
const roomsMessageTypes = require("./constants").roomsMessageTypes;

const ROUGH_MAX_ROOMS = 5;
const print = console.log;
class RoomManager {
    constructor(lobbyEmitter) {
        this.lobbyEmitter = lobbyEmitter;
        this.TryJoin = this.TryJoin.bind(this);
        this.inGame = {}; // uID -> rID
        this.openRooms = {}; // rID -> {room, emitter}
        this.availableRooms = [
            ...Array(Math.trunc(1.5 * ROUGH_MAX_ROOMS)).keys(),
        ];
        this.MakeRoomID = this.MakeRoomID.bind(this);
        this.RemoveUser = this.RemoveUser.bind(this);
        this.lock = new ReadWriteLock();
        this.GetInfo = this.GetInfo.bind(this);
    }

    RemoveUser(uID) {
        let rID = this.inGame[uID];
        delete this.inGame[uID];
        this.lock.writeLock((release) => {
            if (!this.openRooms[rID]) {
                release();
                return;
            }
            if (this.openRooms[rID].room.GetInfo().currentPlayers == 1) {
                delete this.openRooms[rID];
                this.availableRooms.push(rID);
            }
            release();
        });
    }

    GetInfo() {
        let info = [];
        for (const roomID in this.openRooms) {
            print(this.openRooms[roomID]);
            info.push(this.openRooms[roomID].room.GetInfo());
        }
        return info;
    }

    MakeRoomID() {
        let id = this.availableRooms.pop();
        return id;
    }

    TryJoin(matchParams) {
        return false;
    }

    CreateRoom(roomSpecs, uID) {
        let rID;
        // Prevents the server from keeping many rooms over the estimate
        if (this.availableRooms.length < 0.5 * ROUGH_MAX_ROOMS) {
            this.lobbyEmitter.emit("create_room_error", createErrors.overMax);
            return;
        }
        this.lock.writeLock((release) => {
            if (!this.availableRooms.length) {
                release();
                this.lobbyEmitter.emit(
                    "create_room_error",
                    createErrors.overMax
                );
                return;
            }
            rID = this.MakeRoomID();
            release();
        });
        let em = new EventEmitter();
        let nRoom = new Room(em, roomSpecs, uID, rID);
        this.openRooms[rID] = { room: nRoom, emitter: em };
        this.inGame[uID] = rID;
        this.lobbyEmitter.emit("rooms_message", roomsMessageTypes.createdRoom, {
            uid: uID,
            rid: rID,
        });
    }
}

module.exports = RoomManager;
