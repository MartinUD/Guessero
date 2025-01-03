export interface PartyMember {
  id: string;
  socket: WebSocket;
  username?: string;
  isHost?: boolean;
  party?: Party;
}

export class Party {
  private partyId: string;
  private members: PartyMember[];
  private isPrivate: boolean;

  constructor(partyId: string) {
    this.partyId = partyId;
    this.members = [];
    this.isPrivate = true;
  }

  addMember(member: PartyMember): void {
    if (this.members.length >= 4) {
      member.socket.send(JSON.stringify({ type: "error", message: "Party is full" }));
    }
    if (this.members.length === 0) {
      member.isHost = true;
    }

    this.members.push(member);
    
    member.socket.send(JSON.stringify({type: "party_joined", partyId: this.partyId, members: this.listMembers(),}))
  }

  removeMember(memberId: string): void {
    const memberIndex = this.members.findIndex((member) => member.id === memberId);

    if (memberIndex === -1) {
      throw new Error("Member not found");
    }

    const [removedMember] = this.members.splice(memberIndex, 1);

    if (removedMember.isHost && this.members.length > 0) {
      this.members[0].isHost = true;
    }

    removedMember.socket.send(JSON.stringify({ type: "party_left", partyId: this.partyId }));
    this.members.forEach((member) => member.socket.send(JSON.stringify({ type: "member_left", memberId })));
  }

  getMembers(): PartyMember[] {
    return [...this.members];
  }

  listMembers(): Omit<PartyMember, "id" | "socket">[] {
    return [...this.members].map((member) => {
      return {
        username: member.username,
        isHost: member.isHost,
      };
    });
  }

  partyMessage(message: string): void {
    this.members.forEach((member) => member.socket.send(message));
  }

  chatMessage(memberId: string, message: string): void {
    const member = this.members.find((member) => member.id === memberId);

    if (!member) {
      throw new Error("Member not found");
    }

    this.members.forEach((member) => {
      if (member.id !== memberId) {
        member.socket.send(JSON.stringify({ type: "chat_message", username: member.username, message }));
      }
    });
  }

  getPartyId(): string {
    return this.partyId;
  }
}
