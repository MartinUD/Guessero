import { Party } from "./partySystem.ts";

const parties = new Map<string, Party>();

Deno.serve((_req) => {
    if (_req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }

      const { socket, response } = Deno.upgradeWebSocket(_req);

      socket.addEventListener("open", () => {
        console.log("a client connected!");
      });

      socket.addEventListener("close", () => {
        console.log("a client disconnected!");
      });

      socket.addEventListener("message", (event) => {

        try {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case "create_party":
                    handleCraeteParty(socket, message.payload);
                    break;
                default:
                    socket.send(JSON.stringify({ type: "error", message: "Unknown"}));
                    break;
            }
            
        } catch (err) {
            console.error("Invalid message format:", err);
            socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));

        }
        
      });
    
      return response;
  });

  function handleCraeteParty (socket: WebSocket, payload: any) {
    const { partyId, memberId, name } = payload;
      if (parties.has(partyId)) {
          socket.send(JSON.stringify({ type: "error", message: "Party already exists"}));
          return;
      }
        const party = new Party(partyId);

        party.addMember({ id: memberId, name: name, isHost: true });

        parties.set(partyId, party);

        socket.send(
            JSON.stringify({
              type: "party_created",
              partyId,
              members: party.getMembers(),
            })
          );

        console.log(`Party created with ID: ${partyId} by member: ${name} (${memberId})`);
  }

  //deno run --allow-net ws.ts