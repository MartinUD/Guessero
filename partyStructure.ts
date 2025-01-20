export interface PartyMember {
  id: string;
  socket: WebSocket;
  username?: string;
  isHost?: boolean;
  party?: Party;
  categoryAnswers?: { category: string, answer: string, isComplete: boolean }[];
}

export class Party {
  private partyId: string;
  private members: PartyMember[];
  private isPrivate: boolean;
  private isGameStarted: boolean;
  private currentCategories: string[];
  private gameTimer: number | null = null;

  constructor(partyId: string, isPrivate: boolean) {
    this.partyId = partyId;
    this.members = [];
    this.isPrivate = isPrivate;
    this.isGameStarted = false;
    this.currentCategories = [];
  }

  addMember(member: PartyMember, username: string): void {
    if (this.members.length >= 4) {
      member.socket.send(JSON.stringify({ type: "error", message: "Party is full" }));
      return;
    }
    if (this.members.length === 0) {
      member.isHost = true;
    }

    this.members.push(member);
    member.party = this;
    member.username = username

    member.socket.send(JSON.stringify({ type: "party_joined", partyId: this.partyId, members: this.listMembers(), isPrivate: this.isPrivate }))
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

  isPartyPrivate(): boolean {
    return this.isPrivate;
  }

  isGameInProgress(): boolean {
    return this.isGameStarted;
  }

  startGame(duration: number): void {
    this.isGameStarted = true;
    this.currentCategories = this.getRandomCategories();
    this.partyMessage(JSON.stringify({ type: "game_started", categories: this.currentCategories }))
    this.startGameTimer(duration);
  }

  endGame(): void {
    this.isGameStarted = false;
    this.currentCategories = [];
    this.partyMessage(JSON.stringify({ type: "game_ended" }));
  }

  private startGameTimer(duration: number): void {
    this.gameTimer = setTimeout(() => {
      this.endGame();
    }, duration);
  }

  //<NOTE> Make amount of categories dynamic when more available
  getRandomCategories(): string[] {
    const availableCategories = Deno.readTextFileSync("./gameData/categories.json");
    const parsedCategories = JSON.parse(availableCategories);
    const randomCategories = new Set<string>();

    while (randomCategories.size < 3) {
      const randomIndex = Math.floor(Math.random() * parsedCategories.categories.length);
      randomCategories.add(parsedCategories.categories[randomIndex]);
    }
    return Array.from(randomCategories);
  }
}
