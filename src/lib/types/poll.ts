import {
  dbPollChoices,
  dbPolls,
  dbRankedVotes,
  dbSingleVotes,
} from "@/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as z from "zod";

const stringDates = {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
};

export type PollChoice = InferSelectModel<typeof dbPollChoices>;
export const PollChoiceSchema = createSelectSchema(dbPollChoices);
export const ApiPollChoiceSchema = PollChoiceSchema.extend(stringDates);
export const PollChoiceInsertSchema = createInsertSchema(dbPollChoices);
export const PollChoicesUpdateSchema = z.array(
  PollChoiceInsertSchema.pick({
    id: true,
    title: true,
    createdBy: true,
  })
);

export type SingleVote = InferSelectModel<typeof dbSingleVotes>;
export const SingleVoteSchema = createSelectSchema(dbSingleVotes);
export const ApiSingleVoteSchema = SingleVoteSchema.extend(stringDates);
export const SingleVoteInsertSchema = createInsertSchema(dbSingleVotes);
export type RankedVote = InferSelectModel<typeof dbRankedVotes>;
export const RankedVoteSchema = createSelectSchema(dbRankedVotes);
export const ApiRankedVoteSchema = RankedVoteSchema.extend(stringDates);
export const RankedVoteInsertSchema = z.object({
  pollId: z.string(),
  ranking: z.array(z.string()),
});

export type Poll = InferSelectModel<typeof dbPolls>;
export type PollWChoices = Poll & { PollChoices: PollChoice[] };
export type PollwSVotes = Poll & {
  PollChoices: PollChoice[];
  SingleVotes: SingleVote[];
};
export type PollwRVotes = Poll & {
  PollChoices: PollChoice[];
  RankedVotes: RankedVote[];
};

export const PollSchema = createSelectSchema(dbPolls);
export const ApiPollSchema = PollSchema.extend(stringDates);
export const PollInsertSchema = createInsertSchema(dbPolls);
export const PollUpdateSchema = PollInsertSchema.pick({
  title: true,
  description: true,
  updatedAt: true,
});
export const ApiPollwChoicesSchema = ApiPollSchema.extend({
  PollChoices: z.array(ApiPollChoiceSchema),
});
export const ApiPollwSVotesSchema = ApiPollwChoicesSchema.extend({
  SingleVotes: z.array(ApiSingleVoteSchema),
});
export const ApiPollwRVotesSchema = ApiPollwChoicesSchema.extend({
  RankedVotes: z.array(ApiRankedVoteSchema),
});

export const CreatePollResultSchema = z.object({
  message: z.string(),
  id: z.string(),
});

export const RankedResultSchema = z.object({
  winner: z.string().nullable(),
  numberOfVotes: z.number(),
  threshold: z.number(),
  voteType: PollSchema.shape.voteType,
  stages: z
    .object({
      highestChoiceId: z.string(),
      lowestChoiceId: z.string(),
      highestChoice: z.number(),
      lowestChoice: z.number(),
      eliminatedChoiceIds: z.array(z.string()),
      tallyCount: z.record(z.number()),
    })
    .array(),
});
export type RankedResult = z.infer<typeof RankedResultSchema>;

export const SingleResultSchema = z.object({
  tally: z.record(z.number()),
  winner: z.string().nullable(),
  numberOfVotes: z.number(),
  threshold: z.number(),
  voteType: PollSchema.shape.voteType,
});
export type SingleResult = z.infer<typeof SingleResultSchema>;

export const IsSingleResult = z
  .object({
    result: z.object({
      voteType: PollSchema.shape.voteType,
    }),
  })
  .transform((val) => val.result.voteType === "single");
