"use client";
import { Center } from "@/components/layout/center";
import {
  RankedVote,
  formConfig as rankedFormConfig,
} from "@/components/layout/vote/ranked-vote";
import {
  SingleVote,
  formConfig as singleFormConfig,
} from "@/components/layout/vote/single-vote";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import type { PollWChoices } from "@/lib/types";
import { ApiErrorSchema } from "@/lib/types";
import { useClerk } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRight, Settings } from "lucide-react";
import Link from "next/link";
import { useReducer } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type State = {
  isLoading: boolean;
  pollSubmitted: boolean;
};

type Action =
  | { type: "submitVote" }
  | {
      type: "submitVoteSuccess";
    }
  | {
      type: "submitVoteError";
    };

type VoteData = {
  pollId: string;
  ranking?: string[];
  pollChoiceId?: string;
  [key: string]: string | string[] | undefined;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "submitVote":
      return {
        ...state,
        isLoading: true,
      };
    case "submitVoteSuccess":
      return {
        ...state,
        isLoading: false,
        pollSubmitted: true,
      };
    case "submitVoteError":
      return {
        ...state,
        isLoading: false,
      };
    default:
      throw new Error("Invalid action type");
  }
};

export function PollComponent(props: { poll: PollWChoices }) {
  const { poll } = props;
  const formConfig =
    poll.voteType === "single" ? singleFormConfig() : rankedFormConfig(poll);
  const formSchema = formConfig.schema;
  const defaultValues = formConfig.defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [state, dispatch] = useReducer(reducer, {
    isLoading: false,
    pollSubmitted: false,
  });
  const { toast } = useToast();
  const { user } = useClerk();

  async function submitVote(data: VoteData) {
    try {
      dispatch({ type: "submitVote" });

      if (poll.voteType === "ranked") {
        const dataRecord = data as Record<string, string>;
        const ranking = [dataRecord["0"]];
        for (let i = 1; i < poll.PollChoices.length; i++) {
          const val = dataRecord[i.toString()];
          if (!val) break;
          ranking.push(val);
        }
        data.ranking = ranking;
      }
      const response = await fetch(`/api/poll/${poll.id}/vote`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message);
      }

      dispatch({ type: "submitVoteSuccess" });
      toast({ title: "Vote submitted successfully" });
    } catch (error) {
      const { message } = ApiErrorSchema.parse(error);
      dispatch({ type: "submitVoteError" });
      toast({ title: message, variant: "destructive" });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const invalidRecord: Record<string, string> = formConfig.validator(
      values as any,
      poll.PollChoices
    );
    const invalidFields = Object.keys(invalidRecord);
    if (invalidFields.length > 0) {
      invalidFields.forEach((field) => {
        form.setError(field, {
          type: "custom",
          message: invalidRecord[field],
        });
      });
      return;
    }

    await submitVote({ ...values, pollId: poll.id, voterId: user?.id });
  }

  const isOwner = user?.id === poll.createdBy;

  return (
    <div>
      {isOwner && (
        <div className="flex flex-row-reverse pt-4 pr-4">
          <Link href={`/poll/${poll.id}/edit`}>
            <Settings color="hsl(var(--primary))" />
          </Link>
        </div>
      )}
      <Center>
        <div className="text-xl font-bold mb-1">{poll.title}</div>
        <div className="text-base italic mb-1">{poll.description}</div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {poll.voteType === "single" ? (
              <SingleVote poll={poll} />
            ) : (
              <RankedVote poll={poll} />
            )}
            <div className="mt-7">
              <Button
                type="submit"
                className="w-full"
                variant="secondary"
                loading={state.isLoading}
                disabled={poll.isClosed || state.pollSubmitted}
              >
                {poll.isClosed
                  ? "Poll Closed!"
                  : state.pollSubmitted
                  ? "Vote Submitted!"
                  : "Submit Vote!"}
              </Button>
            </div>
          </form>
        </Form>
        <Link
          href={`/poll/${poll.id}/result`}
          className="flex items-center text-blue-500 mt-4 justify-end"
        >
          <span className="mr-2">View Results</span>
          <MoveRight className="inline" />
        </Link>
      </Center>
    </div>
  );
}
