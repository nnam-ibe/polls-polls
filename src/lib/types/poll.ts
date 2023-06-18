import * as z from "zod";

export const PollChoiceSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(32),
  pollId: z.string(),
});

export const APIPollChoiceSchema = PollChoiceSchema.omit({
  id: true,
});

const VoteType = z.enum(["single", "ranked"]);

export const PollSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(32),
  description: z.string(),
  voteType: VoteType,
  isPrivate: z.boolean(),
  isActive: z.boolean(),
  isClosed: z.boolean(),
  createdBy: z.string().nullable().optional(),
});

export const APIPollSchema = PollSchema.extend({
  id: z.string().optional(),
  description: z.string().max(64).default(""),
  isPrivate: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isClosed: z.boolean().default(false),
});

export const PollWChoicesSchema = PollSchema.extend({
  PollChoice: z.array(PollChoiceSchema),
});

export const CreatePollResultSchema = z.object({
  message: z.string(),
  id: z.string(),
});

export const SingleVoteSchema = z.object({
  id: z.string().optional(),
  pollId: z.string(),
  choiceId: z.string(),
  userId: z.string().optional(),
});

export const RankedResultSchema = z.object({
  winner: z.string().nullable(),
  numberOfVotes: z.number(),
  threshold: z.number(),
  voteType: VoteType,
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

export const SingleResultSchema = z.object({
  tally: z.record(z.number()),
  winner: z.string().nullable(),
  numberOfVotes: z.number(),
  threshold: z.number(),
  voteType: VoteType,
});

export const IsSingleResult = z
  .object({
    result: z.object({
      voteType: VoteType,
    }),
  })
  .transform((val) => val.result.voteType === "single");

export type Poll = z.infer<typeof PollSchema>;
export type PollWChoices = z.infer<typeof PollWChoicesSchema>;
export type APIPoll = z.infer<typeof APIPollSchema>;

export type PollChoice = z.infer<typeof PollChoiceSchema>;
export type APIPollChoice = z.infer<typeof APIPollChoiceSchema>;

export type SingleVote = z.infer<typeof SingleVoteSchema>;

export type RankedResult = z.infer<typeof RankedResultSchema>;
export type SingleResult = z.infer<typeof SingleResultSchema>;
