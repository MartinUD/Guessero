import { Party } from "./partySystem.ts";

const parties = new Map<string, Party>();
const websocketUserMap = new WeakMap<WebSocket, string>();

Deno.serve((_req) => {
  if (_req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(_req);

  socket.addEventListener("open", () => {
    const assignedUserId = crypto.randomUUID();
    websocketUserMap.set(socket, assignedUserId);
    console.log("a new client connected with ID:", assignedUserId);
  });

  socket.addEventListener("close", () => {
    const userId = websocketUserMap.get(socket);
    if (userId) {
      for (const [partyId, party] of parties.entries()) {
        const member = party.getMembers().find((member) =>
          member.id === userId
        );
        if (member) {
          party.removeMember(userId);
          if (party.getMembers().length === 0) {
            parties.delete(partyId);
            console.log(`Party deleted with ID: ${partyId}`);
          }
        }
      }
    }
    console.log("a client disconnected!");
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      const userId = websocketUserMap.get(socket);

      if (!userId) {
        socket.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
        return;
      }
      switch (message.type) {
        case "create_party":
          handleCreateParty(socket, message.payload, userId);
          break;

        case "join_party":
          handleJoinParty(socket, message.payload, userId);
          break;

        case "leave_party":
          handleLeaveParty(socket, message.payload, userId);
          break;

        case "list_parties":
          handleListParties(socket);
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

function handleCreateParty(socket: WebSocket, payload: { partyId: string; username: string }, memberId: string) {
  const { partyId, username } = payload;

  if (!payload || !payload.partyId || !payload.username) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    return;
  }
  if (parties.has(partyId)) {
    socket.send(JSON.stringify({ type: "error", message: "Party already exists" }));
    return;
  }

  const party = new Party(partyId);

  party.addMember({ id: memberId, username: username});

  parties.set(partyId, party);

  socket.send(JSON.stringify({type: "party_created", partyId, members: party.listMembers()}));

  console.log(
    `Party created with ID: [${partyId}] by member: ${username} (${memberId})`,
  );
}

function handleJoinParty(socket: WebSocket, payload: { partyId: string, username: string }, memberId: string) {
  const { partyId, username } = payload;
  const party = parties.get(partyId);

  if (!payload || !payload.partyId || !payload.username) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    return;
  }
  if (!party) {
    socket.send(JSON.stringify({ type: "error", message: "Party not found" }));
    return;
  }
  if (party.getMembers().some((member) => member.username === username)) {
    socket.send(JSON.stringify({ type: "error", message: "Username already taken" }));
    return;
  }

  socket.send(party.addMember({ id: memberId, username: username, isHost: false }));
}

function handleLeaveParty(socket: WebSocket, payload: { partyId: string }, memberId: string) {
  const { partyId } = payload;
  const party = parties.get(partyId);

  if (!payload || !payload.partyId) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    return;
  }
  if (!party) {
    socket.send(JSON.stringify({ type: "error", message: "Party not found" }));
    return;
  }

  const member = party.getMembers().find((member) => member.id === memberId);

  if (!member) {
    socket.send(JSON.stringify({ type: "error", message: "Member not found" }));
    return;
  }

  party.removeMember(memberId);

  if (party.getMembers().length === 0) {
    parties.delete(partyId);
    console.log(`Party deleted with ID: ${partyId}`);
  }

}

function handleListParties(socket: WebSocket) {
  const activeParties = [...parties.keys()];
  socket.send(JSON.stringify({type: "party_list", parties: activeParties,}),);
}

//deno run --allow-net ws.ts
