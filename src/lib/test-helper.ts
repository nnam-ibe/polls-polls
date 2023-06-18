import {
  rand,
  randBoolean,
  randNumber,
  randPastDate,
  randText,
  randUuid,
} from "@ngneat/falso";
import { Poll, PollChoice, RankedVote, SingleVote } from "@prisma/client";

type Opts = {
  length?: number;
};

function poll(props?: Partial<Poll>): Poll;
function poll(props?: Partial<Poll>, options?: Opts): Poll[];
function poll(props?: Partial<Poll>, options?: Opts): Poll | Poll[] {
  const length = options?.length ?? 1;

  const result: Poll[] = Array.from({ length }).map(() => ({
    id: randUuid(),
    title: randText(),
    description: randText(),
    voteType: rand(["single", "ranked"]),
    isPrivate: randBoolean(),
    isActive: randBoolean(),
    isClosed: randBoolean(),
    createdBy: randUuid(),
    createdAt: randPastDate(),
    updatedAt: randPastDate(),
    ...props,
  }));

  if (length === 1) return result[0];
  return result;
}

function singleVote(props?: Partial<SingleVote>): SingleVote;
function singleVote(props?: Partial<SingleVote>, options?: Opts): SingleVote[];
function singleVote(
  props?: Partial<SingleVote>,
  options?: Opts
): SingleVote | SingleVote[] {
  const length = options?.length ?? 1;

  const result: SingleVote[] = Array.from({ length }).map(() => ({
    id: randUuid(),
    pollId: randUuid(),
    pollChoiceId: randUuid(),
    voterId: randUuid(),
    createdAt: randPastDate(),
    updatedAt: randPastDate(),
    ...props,
  }));

  if (length === 1) return result[0];
  return result;
}

function rankedVote(props?: Partial<RankedVote>): RankedVote;
function rankedVote(props?: Partial<RankedVote>, options?: Opts): RankedVote[];
function rankedVote(
  props?: Partial<RankedVote>,
  options?: Opts
): RankedVote | RankedVote[] {
  const length = options?.length ?? 1;

  const VoteId = randUuid();
  const pollId = randUuid();
  const result: RankedVote[] = Array.from({ length }).map(() => ({
    id: randUuid(),
    pollId,
    pollChoiceId: randUuid(),
    voterId: randUuid(),
    VoteId,
    rank: randNumber({ min: 1, max: 10 }),
    createdAt: randPastDate(),
    updatedAt: randPastDate(),
    ...props,
  }));

  if (length === 1) return result[0];
  return result;
}

function pollChoice(props?: Partial<PollChoice>): PollChoice;
function pollChoice(props?: Partial<PollChoice>, options?: Opts): PollChoice[];
function pollChoice(
  props?: Partial<PollChoice>,
  options?: Opts
): PollChoice | PollChoice[] {
  const length = options?.length ?? 1;

  const result: PollChoice[] = Array.from({ length }).map(() => ({
    id: randUuid(),
    title: randText(),
    pollId: randUuid(),
    createdAt: randPastDate(),
    updatedAt: randPastDate(),
    ...props,
  }));

  if (length === 1) return result[0];
  return result;
}

export const faker = {
  poll,
  singleVote,
  pollChoice,
  rankedVote,
};
