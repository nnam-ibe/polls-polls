import { faker } from "@/lib/test-helper";
import { singleResult } from "./single-result";

describe("poll/[id]/result/single-result", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });

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
