interface PartyMember {
    id: string;
    name?: string;
}

class Party {
    private partyId: string;
    private hostId: string;
    private members: PartyMember[];
    private maxSize: number;

    constructor(partyId: string, hostId: string) {
        this.partyId = partyId;
        this.hostId = hostId;
        this.members = [{ id: hostId }];
        this.maxSize = 4;
    }

    addMember(member: PartyMember): void {
        if (this.members.length >= this.maxSize) {
            throw new Error('Party is full');
        }
        this.members.push(member);
    }

    removeMember(userId: string): void {
        if (userId === this.hostId) {
            throw new Error('Host cannot be removed');
        }
        this.members = this.members.filter(member => member.id !== userId);
    }
    /*
    getMembers(): PartyMember[] {
        return [...this.members];
    }

    getPartyId(): string {
        return this.partyId;
    }
    */
}

// Usage
const party = new Party('party123', 'user1');
party.addMember({ id: 'user2', name: 'John' });
