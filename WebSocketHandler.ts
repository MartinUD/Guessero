import { PartyMember } from "./partyStructure.ts";

import {
  gameIsSubstringInCategory,
  gameStart
} from "./gameHandlers.ts";

import {
  handleCreateParty,
  handleJoinParty,
  handleLeaveParty,
  handleListParties,
  handleChatMessage
} from "./partyHandlers.ts";


const websocketUserMap = new WeakMap<WebSocket, PartyMember>();

Deno.serve((_req) => {
  if (_req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(_req);

  socket.addEventListener("open", () => {
    const assignedUserId = crypto.randomUUID();
    const member: PartyMember = { id: assignedUserId, socket: socket };

    websocketUserMap.set(socket, member);
    console.log("a new client connected with ID:", assignedUserId);
  });

  socket.addEventListener("close", () => {
    const user = websocketUserMap.get(socket);
    if (user && user.party) {
      handleLeaveParty(socket, user);
    }
    websocketUserMap.delete(socket);
    console.log("client disconnected");
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      const user = websocketUserMap.get(socket);

      if (!user) {
        socket.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
        return;
      }
      switch (message.type) {
        case "create_party":
          handleCreateParty(socket, message.partyId, message.username, message.isPrivate, user);
          break;

        case "join_party":
          handleJoinParty(socket, message.partyId, message.username, user);
          break;

        case "leave_party":
          handleLeaveParty(socket, user);
          break;

        case "list_parties":
          handleListParties(socket);
          break;

        case "chat_message":
          handleChatMessage(socket, message.chat_message, user);
          break;

        case "game_start":
          gameStart(socket, message.game_duration, user);
          break;

        case "game_guess":
          gameIsSubstringInCategory(socket, message.category, message.answer, user);
          break;

        default:
          socket.send(JSON.stringify({ type: "error", message: "Unknown" }));
          break;
      }
    } catch (err) {
      console.error("Invalid message format:", err);
      socket.send(
        JSON.stringify({ type: "error", message: "Invalid message format" }),
      );
    }
  });

  return response;
});

//deno run --allow-net ws.ts
