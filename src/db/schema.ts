import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const smallTextLength = 64;
export const voteTypeEnum = pgEnum("vote_type", ["single", "ranked"]);

export const dbPolls = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: smallTextLength }).notNull(),
  description: varchar("description", { length: smallTextLength }).default(""),
  voteType: voteTypeEnum("vote_type").notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isClosed: boolean("is_closed").default(false).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dbPollRelations = relations(dbPolls, ({ many }) => ({
  PollChoices: many(dbPollChoices),
  SingleVotes: many(dbSingleVotes),
  RankedVotes: many(dbRankedVotes),
}));

export const dbPollChoices = pgTable("poll_choices", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: smallTextLength }).notNull(),
  pollId: uuid("poll_id").notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dbPollChoiceRelations = relations(
  dbPollChoices,
  ({ one, many }) => ({
    Poll: one(dbPolls, {
      fields: [dbPollChoices.pollId],
      references: [dbPolls.id],
    }),
    SingleVotes: many(dbSingleVotes),
    RankedVotes: many(dbRankedVotes),
  })
);

export const dbSingleVotes = pgTable("single_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id").notNull(),
  pollChoiceId: uuid("poll_choice_id").notNull(),
  voterId: varchar("voter_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dbSingleVotesRelations = relations(dbSingleVotes, ({ one }) => ({
  Poll: one(dbPolls, {
    fields: [dbSingleVotes.pollId],
    references: [dbPolls.id],
  }),
  PollChoice: one(dbPollChoices, {
    fields: [dbSingleVotes.pollChoiceId],
    references: [dbPollChoices.id],
  }),
}));

export const dbRankedVotes = pgTable("ranked_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id").notNull(),
  pollChoiceId: uuid("poll_choice_id").notNull(),
  voterId: varchar("voter_id", { length: 255 }),
  VoteId: uuid("vote_id").notNull(),
  rank: integer("rank").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dbRankedVotesRelations = relations(dbRankedVotes, ({ one }) => ({
  Poll: one(dbPolls, {
    fields: [dbRankedVotes.pollId],
    references: [dbPolls.id],
  }),
  PollChoice: one(dbPollChoices, {
    fields: [dbRankedVotes.pollChoiceId],
    references: [dbPollChoices.id],
  }),
}));
