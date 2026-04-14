import "dotenv/config";

import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { PirateShooterRoom } from "./rooms/PirateShooterRoom.js";

const port = Number(process.env.PORT ?? process.env.COLYSEUS_PORT ?? "2567");
const roomName = process.env.COLYSEUS_ROOM_NAME ?? "pirate_shooter_v2";

const gameServer = new Server({
  transport: new WebSocketTransport({
    pingInterval: 10_000,
    pingMaxRetries: 4,
  }),
});

gameServer.define(roomName, PirateShooterRoom);

gameServer.listen(port);

console.log(`[colyseus] room "${roomName}" listening on port ${port}`);
