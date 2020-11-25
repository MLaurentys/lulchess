/*
 * This file is responsible for setting up the server and providing
 *  new connections with callback and handling methods
 */

const webSocketServer = require("websocket").server;
const http = require("http");

// Server Configuration
const servConsts = require("./constants");
const webSocketsServerPort = servConsts.webSocketsServerPort;
const clientMTypes = servConsts.clientMTypes;
const appEmitterMTypes = require("./constants").appEmitterMTypes;

//Helper
const print = console.log;

class LCServer {
    constructor(appEmitter) {
        this.server = http.createServer();
        this.server.listen(webSocketsServerPort);
        this.wsServer = new webSocketServer({
            httpServer: this.server,
        });
        this.clients = {};
        this.appEmitter = appEmitter;

        this.HandleMessage = this.HandleMessage.bind(this);
        this.ReceiveNewConnection = this.ReceiveNewConnection.bind(this);
        this.SendMessage = this.SendMessage.bind(this);

        this.wsServer.on("request", this.ReceiveNewConnection);
        this.appEmitter.on(appEmitterMTypes.activeRooms, (cID, rooms) =>
            this.SendMessage("activeRooms", cID, rooms)
        );
        this.appEmitter.on(appEmitterMTypes.createdRoom, (cID, rID) =>
            this.SendMessage("createdRoom", cID, rID)
        );
        this.appEmitter.on(appEmitterMTypes.leftRoom, (cID) =>
            this.SendMessage("leftRoom", cID, "")
        );
        this.appEmitter.on(
            appEmitterMTypes.joinedStatus,
            (cID, status, rID) => {
                if (status) this.SendMessage("joined", cID, rID);
                else this.SendMessage("notJoin", cID, "");
            }
        );
    }

    SendMessage(messageType, cID, infoObject) {
        if (!this.clients[cID]) return;
        this.clients[cID].send(messageType + " " + JSON.stringify(infoObject));
    }

    ReceiveNewConnection(request) {
        let uID = getID();
        const connection = request.accept(null, request.origin);
        this.clients[uID] = connection;
        console.log("NEW CONNECTION: " + uID);
        connection.on("message", (event) => {
            this.HandleMessage(uID, event);
        });
        connection.on("close", (a, b) => this.CloseConnection(uID, a, b));
        this.SendMessage("uID", uID, uID);
    }

    CloseConnection(uID, code, reason) {
        print("LEAVING: " + uID);
        this.appEmitter.emit("user_disconnected", uID);
        delete this.clients[uID];
    }

    HandleMessage(cnID, event) {
        console.log("Message from: " + cnID);
        let params = JSON.parse(event.utf8Data);
        if (!params.hasOwnProperty("messageType")) {
            console.log("Unspecified Request. Ignoring...");
            return;
        }
        let mType = params.messageType;
        if (!clientMTypes.hasOwnProperty(mType)) {
            console.log("Bad Request. Ignoring...");
            return;
        }
        console.log("Good Request");
        console.log(params);
        switch (clientMTypes.mType) {
            case clientMTypes.getPieces:
                break;
            case clientMTypes.createMatch:
                this.appEmitter.emit(
                    appEmitterMTypes.createMatch,
                    cnID,
                    params
                );
                break;
            case clientMTypes.getActiveRooms:
                this.appEmitter.emit(
                    appEmitterMTypes.activeRooms,
                    cnID,
                    params
                );

            default:
                this.appEmitter.emit(appEmitterMTypes[mType], cnID, params);
        }
    }
}

module.exports = LCServer;

// TODO: Use OpenID
function getID() {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    return s4() + s4() + "-" + s4();
}
