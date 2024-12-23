interface PartyMember {
    id: string;
    name?: string;
    isHost?: boolean;
}

class Party {
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

const testParty = new Party('party123');
testParty.addMember({ id: 'user1', name : 'Alice' });
testParty.addMember({ id: 'user2', name : 'Bob' });
console.log(testParty.getMembers());

