export interface PartyMember {
    id: string;
    name?: string;
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
    getMembers(): PartyMember[] {
        return [...this.members];
    }
}

