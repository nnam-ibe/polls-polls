import rVoteFixture from "@/lib/fixtures/ranked-votes.json";
import { faker } from "@/lib/test-helper";
import type { PollwRVotes } from "./collate-votes";
import {
  compileStage,
  groupVotesByVoteId,
  rankedResult,
  singleResult,
} from "./collate-votes";

type WithDate = {
  createdAt: string;
  updatedAt: string;
};

function parseRankedFixtures<T extends WithDate>(records: T[]) {
  return records.map((v) => ({
    ...v,
    createdAt: new Date(v.createdAt),
    updatedAt: new Date(v.updatedAt),
  }));
}

function parsePollRankedFixture(
  record: typeof rVoteFixture.singleVoteTally
): PollwRVotes {
  return {
    ...record,
    voteType: "ranked",
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    RankedVote: parseRankedFixtures(record.RankedVote),
    PollChoice: parseRankedFixtures(record.PollChoice),
  };
}

describe("poll/[id]/result/collate-votes", () => {
  describe("singleResult", () => {
    it("should calculate poll winner and tally", () => {
      const poll = faker.poll();
      const pollChoices = [
        faker.pollChoice({ pollId: poll.id, title: "Yes" }),
        faker.pollChoice({ pollId: poll.id, title: "No" }),
        faker.pollChoice({ pollId: poll.id, title: "Maybe" }),
      ];
      const votes = [
        ...faker.singleVote(
          {
            pollId: poll.id,
            pollChoiceId: pollChoices[0].id,
          },
          { length: 3 }
        ),
        ...faker.singleVote(
          {
            pollId: poll.id,
            pollChoiceId: pollChoices[1].id,
          },
          { length: 2 }
        ),
      ];

      const result = singleResult({
        ...poll,
        PollChoice: pollChoices,
        SingleVote: votes,
      });

      expect(result).toEqual({
        tally: {
          [pollChoices[0].id]: 3,
          [pollChoices[1].id]: 2,
          [pollChoices[2].id]: 0,
        },
        winner: pollChoices[0].id,
      });
    });

    it("winner should be null when 50+1 is not met", () => {
      const poll = faker.poll();
      const pollChoices = [
        faker.pollChoice({ pollId: poll.id, title: "Yes" }),
        faker.pollChoice({ pollId: poll.id, title: "No" }),
        faker.pollChoice({ pollId: poll.id, title: "Maybe" }),
      ];
      const votes = [
        ...faker.singleVote(
          {
            pollId: poll.id,
            pollChoiceId: pollChoices[0].id,
          },
          { length: 3 }
        ),
        ...faker.singleVote(
          {
            pollId: poll.id,
            pollChoiceId: pollChoices[1].id,
          },
          { length: 2 }
        ),
        faker.singleVote({
          pollId: poll.id,
          pollChoiceId: pollChoices[2].id,
        }),
      ];

      const result = singleResult({
        ...poll,
        PollChoice: pollChoices,
        SingleVote: votes,
      });

      expect(result).toEqual({
        tally: {
          [pollChoices[0].id]: 3,
          [pollChoices[1].id]: 2,
          [pollChoices[2].id]: 1,
        },
        winner: null,
      });
    });
  });

  describe("rankedResult", () => {
    it("should group votes by id", () => {
      const rankedVotes = parseRankedFixtures(rVoteFixture.groupById);
      const { voteIds, votesById } = groupVotesByVoteId(rankedVotes);

      expect(voteIds).toEqual(new Set(["red", "blue", "green"]));
      expect(votesById).toEqual({
        red: [rankedVotes[0], rankedVotes[1], rankedVotes[2]],
        blue: [rankedVotes[3], rankedVotes[4], rankedVotes[5]],
        green: [rankedVotes[8], rankedVotes[6], rankedVotes[7]],
      });
    });

    it("should correctly compileStage", () => {
      const poll = parsePollRankedFixture(rVoteFixture.eliminatedVote);
      const pollChoices = poll.PollChoice;

      const result = compileStage({
        poll,
        voteIds: new Set([
          "red",
          "blue",
          "green",
          "purple",
          "violet",
          "indigo",
        ]),
        votesById: groupVotesByVoteId(poll.RankedVote).votesById,
        eliminatedChoiceIds: new Set([pollChoices[1].id]),
        cutoff: 0,
      });

      expect(result).toEqual({
        highestChoiceId: pollChoices[0].id,
        highestChoiceCount: 4,
        lowestChoiceId: pollChoices[2].id,
        lowestChoiceCount: 2,
        tallyCount: {
          [pollChoices[0].id]: 4,
          [pollChoices[1].id]: 0,
          [pollChoices[2].id]: 2,
        },
      });
    });

    it("should return winner and tally", () => {
      const poll = parsePollRankedFixture(rVoteFixture.singleVoteTally);

      const pollChoices = poll.PollChoice;
      const { stages, winner, numberOfVotes, threshold } = rankedResult(poll);

      expect(numberOfVotes).toEqual(4);
      expect(threshold).toEqual(3);
      expect(winner).toEqual(pollChoices[0].id);
      expect(stages).toHaveLength(1);
      expect(stages[0]).toEqual({
        highestChoiceId: pollChoices[0].id,
        highestChoiceCount: 3,
        lowestChoiceId: pollChoices[1].id,
        lowestChoiceCount: 0,
        tallyCount: {
          [pollChoices[0].id]: 3,
          [pollChoices[1].id]: 0,
          [pollChoices[2].id]: 1,
        },
        eliminatedChoiceIds: [pollChoices[1].id],
      });
    });

    it("should correctly collate multi-stage results", () => {
      const poll = parsePollRankedFixture(rVoteFixture.multiStageResult);
      const { stages, winner, numberOfVotes, threshold } = rankedResult(poll);

      expect(numberOfVotes).toEqual(9);
      expect(threshold).toEqual(5);
      expect(winner).toEqual("Choice I");
      expect(stages).toHaveLength(3);

      expect(stages[0]).toEqual({
        highestChoiceId: "Choice I",
        highestChoiceCount: 3,
        lowestChoiceCount: 1,
        lowestChoiceId: "Choice IV",
        tallyCount: {
          "Choice I": 3,
          "Choice II": 2,
          "Choice III": 3,
          "Choice IV": 1,
        },
        eliminatedChoiceIds: ["Choice IV"],
      });
      expect(stages[1]).toEqual({
        highestChoiceId: "Choice III",
        highestChoiceCount: 4,
        lowestChoiceCount: 2,
        lowestChoiceId: "Choice II",
        tallyCount: {
          "Choice I": 3,
          "Choice II": 2,
          "Choice III": 4,
          "Choice IV": 0,
        },
        eliminatedChoiceIds: ["Choice IV", "Choice II"],
      });
      expect(stages[2]).toEqual({
        highestChoiceId: "Choice I",
        highestChoiceCount: 5,
        lowestChoiceCount: 4,
        lowestChoiceId: "Choice III",
        tallyCount: {
          "Choice I": 5,
          "Choice II": 0,
          "Choice III": 4,
          "Choice IV": 0,
        },
        eliminatedChoiceIds: ["Choice IV", "Choice II", "Choice III"],
      });
    });

    it("should terminates there can be no winner", () => {
      const poll = parsePollRankedFixture(rVoteFixture.noWinner);
      const { stages, winner, numberOfVotes, threshold } = rankedResult(poll);

      expect(numberOfVotes).toEqual(9);
      expect(threshold).toEqual(5);
      expect(winner).toEqual(null);
      expect(stages).toHaveLength(2);

      expect(stages[0]).toEqual({
        highestChoiceId: "Choice I",
        highestChoiceCount: 3,
        lowestChoiceCount: 1,
        lowestChoiceId: "Choice IV",
        tallyCount: {
          "Choice I": 3,
          "Choice II": 2,
          "Choice III": 3,
          "Choice IV": 1,
        },
        eliminatedChoiceIds: ["Choice IV"],
      });
      expect(stages[1]).toEqual({
        highestChoiceId: "Choice I",
        highestChoiceCount: 3,
        lowestChoiceCount: 3,
        lowestChoiceId: "Choice I",
        tallyCount: {
          "Choice I": 3,
          "Choice II": 3,
          "Choice III": 3,
          "Choice IV": 0,
        },
        eliminatedChoiceIds: expect.any(Array),
      });
    });
  });
});
