import { Party, PartyMember } from "./partyStructure.ts";

const parties = new Map<string, Party>();

export function handleCreateParty(socket: WebSocket, payload: { partyId: string; username: string }, member: PartyMember) {
  const { partyId, username} = payload;

  if (!payload || !payload.partyId || !payload.username) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    return;
  }
  if (parties.has(partyId)) {
    socket.send(JSON.stringify({ type: "error", message: "Unable to create party" }));
    return;
  }
  if(member.party) {
    member.party.removeMember(member.id);
  }

  const party = new Party(partyId);

  member.username = username;
  member.id = partyId;
  member.party = party;

  socket.send(JSON.stringify({type: "party_created"}));
  party.addMember({ id: member.id, username: member.username, socket: socket});

  parties.set(partyId, party);

  console.log(
    `Party created with ID: [${partyId}] by member: ${member.username} (${member.id})`,
  );
}

export function handleJoinParty(socket: WebSocket, payload: { partyId: string, username: string }, member: PartyMember) {

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
  if(member.party) {
    member.party.removeMember(member.id);
  }
  
  member.username = username;
  member.party = party;

  party.addMember({ id: member.id, username: member.username, socket: socket })
}

export function handleLeaveParty(socket: WebSocket, member: PartyMember) {

  if (!member) {
    socket.send(JSON.stringify({ type: "error", message: "Member not found" }));
    return;
  }
  if (!member.party) {
    socket.send(JSON.stringify({ type: "error", message: "Member not in a party" }));
    return;
  }

  const party = member.party;

  if (!party) {
    socket.send(JSON.stringify({ type: "error", message: "Party not found" }));
    return;
  }

  party.removeMember(member.id);
  member.party = undefined;

  if (party.getMembers().length === 0) {
    parties.delete(party.getPartyId());
    console.log(`Party deleted with ID: ${party.getPartyId()}`);
  }

}

export function handleListParties(socket: WebSocket) {
  const activeParties = [...parties.keys()];
  socket.send(JSON.stringify({type: "party_list", parties: activeParties,}),);
}

export function handleChatMessage(socket: WebSocket, payload: { partyId: string, message: string }, member: PartyMember) {
  const { message } = payload;
  const party = member.party;

  if (!payload || !payload.partyId || !payload.message) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    return;
  }
  if (!party) {
    socket.send(JSON.stringify({ type: "error", message: "Party not found" }));
    return;
  }

  party.chatMessage(member.id, message);
}