"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Center } from "@/components/layout/center";
import {
  SingleVote,
  getFormDefaultsAndSchema as singleGetFormDefaultsAndSchema,
} from "@/components/layout/vote/single-vote";
import {
  RankedVote,
  getFormDefaultsAndSchema as rankedGetFormDefaultsAndSchema,
} from "@/components/layout/vote/ranked-vote";
import { PollWChoices } from "@/lib/types";
import { Button } from "@/components/ui/button";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function fetchPoll(id: string) {
  return fetch(`${baseUrl}/api/poll/${id}`, {
    next: { revalidate: 60 },
  });
}

function PollComponent(props: { poll: PollWChoices }) {
  const { poll } = props;

  const defaultsAndSchema =
    poll.voteType === "single"
      ? singleGetFormDefaultsAndSchema()
      : rankedGetFormDefaultsAndSchema(poll);
  const formSchema = defaultsAndSchema.schema;
  const defaultValues = defaultsAndSchema.defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Ensure the form is valid before submitting
    console.log(values);
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
            <Button type="submit" className="w-full" variant="secondary">
              Submit Vote!
            </Button>
          </div>
        </form>
      </Form>
    </Center>
  );
}

export default async function PollPage({ params }: { params: { id: string } }) {
  const response = await fetchPoll(params.id);
  const poll = (await response.json()) as PollWChoices;

  return <PollComponent poll={poll} />;
}
