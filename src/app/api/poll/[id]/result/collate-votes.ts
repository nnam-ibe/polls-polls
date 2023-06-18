import { Poll, PollChoice, SingleVote, RankedVote } from "@prisma/client";

type PollwSVotes = Poll & {
  PollChoice: PollChoice[];
  SingleVote: SingleVote[];
};

export function singleResult(poll: PollwSVotes) {
  const tallyCount: Record<string, number> = {};
  poll.PollChoice.forEach((choice) => {
    tallyCount[choice.id] = 0;
  });

  let highestChoiceId = poll.PollChoice[0].id;
  let highestChoiceCount = 0;
  let winner: string | null = null;

  poll.SingleVote.forEach((vote) => {
    const choiceId = vote.pollChoiceId;

    const prevCount = tallyCount[choiceId];
    const newCount = prevCount + 1;
    tallyCount[choiceId] = newCount;

    if (newCount > highestChoiceCount) {
      highestChoiceId = choiceId;
      highestChoiceCount = newCount;
    }
  });

  const cutoff = Math.floor(poll.SingleVote.length / 2) + 1;
  if (highestChoiceCount >= cutoff) {
    winner = highestChoiceId;
  }

  return {
    tally: tallyCount,
    winner,
  };
}

export type PollwRVotes = Poll & {
  PollChoice: PollChoice[];
  RankedVote: RankedVote[];
};

export function groupVotesByVoteId(rankedVotes: PollwRVotes["RankedVote"]) {
  const voteIds = new Set<string>();
  const votesById: Record<string, Array<RankedVote>> = {};
  rankedVotes.forEach((vote) => {
    const voteId = vote.VoteId;
    if (!votesById[voteId]) votesById[voteId] = [];

    votesById[voteId].push(vote);
    voteIds.add(voteId);
  });
  voteIds.forEach((voteId) => {
    votesById[voteId].sort((a, b) => a.rank - b.rank);
  });
  return {
    voteIds,
    votesById,
  };
}

type CompileOpts = {
  poll: PollwRVotes;
  voteIds: ReturnType<typeof groupVotesByVoteId>["voteIds"];
  votesById: ReturnType<typeof groupVotesByVoteId>["votesById"];
  eliminatedChoiceIds: Set<string>;
  cutoff: number;
};

export function compileStage({
  poll,
  voteIds,
  votesById,
  eliminatedChoiceIds,
  cutoff,
}: CompileOpts) {
  const tallyCount: Record<string, number> = {};
  poll.PollChoice.forEach((choice) => {
    tallyCount[choice.id] = 0;
  });

  let highestChoiceId = poll.PollChoice[0].id;
  let highestChoiceCount = 0;

  voteIds.forEach((voteId) => {
    const highestRankedVote = votesById[voteId].find((vote) => {
      const choiceId = vote.pollChoiceId;
      if (eliminatedChoiceIds.has(choiceId)) return false;
      if (tallyCount[choiceId] < cutoff) return false;
      return true;
    });

    if (!highestRankedVote) return;

    const choiceId = highestRankedVote.pollChoiceId;
    const prevCount = tallyCount[choiceId];
    const newCount = prevCount + 1;
    tallyCount[choiceId] = newCount;

    if (newCount > highestChoiceCount) {
      highestChoiceId = choiceId;
      highestChoiceCount = newCount;
    }
  });

  // Find the lowest ranked choice
  let lowestChoiceId = highestChoiceId;
  let lowestChoiceCount = highestChoiceCount;

  poll.PollChoice.forEach((choice) => {
    if (eliminatedChoiceIds.has(choice.id)) return;

    const count = tallyCount[choice.id];
    if (count < lowestChoiceCount) {
      lowestChoiceId = choice.id;
      lowestChoiceCount = count;
    }
  });

  return {
    highestChoiceId,
    highestChoiceCount,
    lowestChoiceCount,
    lowestChoiceId,
    tallyCount,
  };
}

type Stage = ReturnType<typeof compileStage> & {
  eliminatedChoiceIds: string[];
};

export function rankedResult(poll: PollwRVotes) {
  const { voteIds, votesById } = groupVotesByVoteId(poll.RankedVote);

  const threshold = Math.floor(voteIds.size / 2) + 1;
  const stages: Stage[] = [];
  let winner: string | null = null;
  let isIndeterminate = false;
  let eliminatedChoiceIds = new Set<string>();
  let cutoff = 0;

  while (!winner && !isIndeterminate) {
    const stage = compileStage({
      poll,
      voteIds,
      votesById,
      eliminatedChoiceIds,
      cutoff,
    });

    if (stage.highestChoiceCount >= threshold) {
      winner = stage.highestChoiceId;
    }
    if (stage.lowestChoiceCount === stage.highestChoiceCount) {
      isIndeterminate = true;
    }

    eliminatedChoiceIds.add(stage.lowestChoiceId);
    poll.PollChoice.forEach((choice) => {
      if (eliminatedChoiceIds.has(choice.id)) return;
      if (stage.tallyCount[choice.id] <= cutoff) {
        eliminatedChoiceIds.add(choice.id);
      }
    });

    stages.push({
      ...stage,
      eliminatedChoiceIds: Array.from(eliminatedChoiceIds),
    });
  }

  return {
    winner,
    stages,
    numberOfVotes: voteIds.size,
    threshold,
  };
}
