import { Poll, PollChoice, SingleVote, RankedVote } from "@prisma/client";

type SingleVotes = Poll & {
  PollChoice: PollChoice[];
  SingleVote: SingleVote[];
};

export function singleResult(votes: SingleVotes) {
  const tallyCount: Record<string, number> = {};
  votes.PollChoice.forEach((choice) => {
    tallyCount[choice.id] = 0;
  });

  let highestChoiceId = votes.PollChoice[0].id;
  let hightChoiceCount = 0;
  let winner: string | null = null;

  votes.SingleVote.forEach((vote) => {
    const choiceId = vote.pollChoiceId;

    const prevCount = tallyCount[choiceId];
    const newCount = prevCount + 1;
    tallyCount[choiceId] = newCount;

    if (newCount > hightChoiceCount) {
      highestChoiceId = choiceId;
      hightChoiceCount = newCount;
    }
  });

  const cutoff = Math.floor(votes.SingleVote.length / 2) + 1;
  if (hightChoiceCount >= cutoff) {
    winner = highestChoiceId;
  }

  return {
    tally: tallyCount,
    winner,
  };
}

type RankedVotes = Poll & {
  PollChoice: PollChoice[];
  RankedVote: RankedVote[];
};
export function rankedResult(votes: RankedVotes) {
  const voteIds = new Set<string>();
  const votesById: Record<string, Array<RankedVote>> = {};
  votes.RankedVote.forEach((vote) => {
    const voteId = vote.VoteId;
    if (!votesById[voteId]) votesById[voteId] = [];

    votesById[voteId].push(vote);
    voteIds.add(voteId);
  });
  voteIds.forEach((voteId) => {
    votesById[voteId].sort((a, b) => a.rank - b.rank);
  });

  return {};
}
