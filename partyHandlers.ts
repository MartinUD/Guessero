import { Party, PartyMember } from "./partyStructure.ts";

const parties = new Map<string, Party>();

export function handleCreateParty(socket: WebSocket, partyId: string, username: string, isPrivate: boolean, member: PartyMember) {

  if (!partyId || !username || isPrivate === undefined) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    return;
  }
  if (parties.has(partyId)) {
    socket.send(JSON.stringify({ type: "error", message: "Unable to create party" }));
    return;
  }
  if(member.party) {
    handleLeaveParty(socket, member);
  }

  const party = new Party(partyId, isPrivate);

  member.username = username;
  member.party = party;

  socket.send(JSON.stringify({type: "party_created"}));
  party.addMember({ id: member.id, username: member.username, socket: socket});

  parties.set(partyId, party);

  console.log(
    `Party created with ID: [${partyId}] by member: ${member.username} (${member.id})`,
  );
}

export function handleJoinParty(socket: WebSocket, partyId: string, username: string, member: PartyMember) {
  const party = parties.get(partyId);

  if (!partyId || !username) {
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
    handleLeaveParty(socket, member);
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
  const publicParties = [...parties.values()].filter(party => party.isPartyPrivate() === false).map(party => party.getPartyId());
  socket.send(JSON.stringify({type: "party_list", parties: publicParties,}),);
}

export function handleChatMessage(socket: WebSocket, chatMessage: string , member: PartyMember) {
  const party = member.party;

  if (!chatMessage) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    return;
  }
  if (!party) {
    socket.send(JSON.stringify({ type: "error", message: "Party not found" }));
    return;
  }

  party.chatMessage(member.id, chatMessage);
}