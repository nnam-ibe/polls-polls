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
import { ApiErrorSchema, PollWChoices } from "@/lib/types";
import { useClerk } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReducer } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

type State = {
  isLoading: boolean;
};

type Action =
  | { type: "submitVote" }
  | {
      type: "submitVoteSuccess";
      toast: ReturnType<typeof useToast>["toast"];
    }
  | {
      type: "submitVoteError";
      toast: ReturnType<typeof useToast>["toast"];
      message: string;
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "submitVote":
      return {
        ...state,
        isLoading: true,
      };
    case "submitVoteSuccess":
      action.toast({ title: "Vote submitted successfully" });
      return {
        ...state,
        isLoading: false,
      };
    case "submitVoteError":
      action.toast({ title: action.message, variant: "destructive" });
      return {
        ...state,
        isLoading: false,
      };
    default:
      throw new Error("Invalid action type");
  }
};

function PollComponent(props: { poll: PollWChoices }) {
  const { poll } = props;

  const formConfig =
    poll.voteType === "single" ? singleFormConfig() : rankedFormConfig(poll);
  const formSchema = formConfig.schema;
  const defaultValues = formConfig.defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [state, dispatch] = useReducer(reducer, { isLoading: false });
  const { toast } = useToast();
  const { user } = useClerk();

  async function submitVote(data: any) {
    try {
      dispatch({ type: "submitVote" });
      const { id } = data;
      const response = await fetch(`${baseUrl}/api/poll/${id}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message);
      }

      dispatch({ type: "submitVoteSuccess", toast });
    } catch (error) {
      const { message } = ApiErrorSchema.parse(error);
      dispatch({ type: "submitVoteError", toast, message });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const invalidRecord: Record<string, string> = formConfig.validator(
      values as any,
      poll.PollChoice
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

    await submitVote(values);
  }

  const VoteComponent = poll.voteType === "single" ? SingleVote : RankedVote;

  return (
    <Center>
      <div className="text-xl font-bold mb-1">{poll.title}</div>
      <div className="text-base italic mb-1">{poll.description}</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <VoteComponent poll={poll} />
          <div className="mt-7">
            <Button
              type="submit"
              className="w-full"
              variant="secondary"
              loading={state.isLoading}
            >
              Submit Vote!
            </Button>
          </div>
        </form>
      </Form>
    </Center>
  );
}

function fetchPoll(id: string) {
  return fetch(`${baseUrl}/api/poll/${id}`, {
    next: { revalidate: 60 },
  });
}

export default async function PollPage({ params }: { params: { id: string } }) {
  const response = await fetchPoll(params.id);
  const poll = (await response.json()) as PollWChoices;

  return <PollComponent poll={poll} />;
}
