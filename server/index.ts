import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { PirateShooterRoom } from "./rooms/PirateShooterRoom.js";

const port = Number(process.env.PORT ?? 2567);

const gameServer = new Server({
  transport: new WebSocketTransport({
    pingInterval: 10_000,
    pingMaxRetries: 4,
  }),
});

gameServer.define("pirate_shooter_v2", PirateShooterRoom);

gameServer.listen(port);

console.log(`[colyseus] pirate_shooter_v2 listening on ws://localhost:${port}`);
