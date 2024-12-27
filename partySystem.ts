export interface PartyMember {
    id: string;
    username?: string;
    isHost?: boolean;
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
            throw new Error('Party is full');
        }
        if (this.members.length === 0) {
            member.isHost = true;
        }
        this.members.push(member);
    }
    removeMember(memberId: string): void {
        const index = this.members.findIndex(member => member.id === memberId);
        if (index === -1) {
            throw new Error('Member not found');
        }
        const [removedMember] = this.members.splice(index, 1);
        if (removedMember.isHost && this.members.length > 0) {
            this.members[0].isHost = true;
        }
    }

    getMembers(): PartyMember[] {
        return [...this.members];
    }

    listMembers(): Omit<PartyMember, "id">[] {
        return [...this.members].map((member) => {
          return {
            username: member.username,
            isHost: member.isHost,
          };
        });
      }

}

