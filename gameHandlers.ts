import { PartyMember } from "./partyStructure.ts";

const categories = JSON.parse(await Deno.readTextFile("./gameData/categoryAnswers.json"));

export function gameStart(socket: WebSocket, duration: number, user: PartyMember): void {
    if (!user.party) {
        socket.send(JSON.stringify({ type: "error", message: "Not in party" }));
        return;
      }
      if(!user.isHost) {
        socket.send(JSON.stringify({ type: "error", message: "Only host can start the game" }));
      }
      if (user.party.isGameInProgress()) {
        socket.send(JSON.stringify({ type: "error", message: "Game already in progress" }));
        return;
      }

      user.party.startGame(duration);
}

export function gameIsSubstringInCategory(socket: WebSocket, category: string, substring: string, user: PartyMember): void {
  
    if (!user.party) {
        socket.send(JSON.stringify({ type: "error", message: "Not in party" }));
        return;
      }
      if (!user.party.isGameInProgress()) {
        socket.send(JSON.stringify({ type: "error", message: "Game not in progress" }));
        return;
      }

    const categoryData = categories.categories.find((categoryData: { name: string }) => categoryData.name === category);

    const isFullMatch = categoryData.words.some((word: string) => word === substring);
    const isPartialMatch = categoryData.words.some((word: string) => word.startsWith(substring));
    
    if (!user.categoryAnswers) {
      user.categoryAnswers = [];
  }

  const existingAnswerIndex = user.categoryAnswers.findIndex(answer => answer.category === category);

  if(existingAnswerIndex !== -1) {
    user.categoryAnswers[existingAnswerIndex] = { category, answer: substring, isComplete: isFullMatch };
  } else { 
    user.categoryAnswers.push({ category, answer: substring, isComplete: isFullMatch });
  }
    socket.send(JSON.stringify({ type: "game_guess_response", category, isFullMatch, isPartialMatch }));
}
