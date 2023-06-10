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
import { PollWChoices } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function fetchPoll(id: string) {
  return fetch(`${baseUrl}/api/poll/${id}`, {
    next: { revalidate: 60 },
  });
}

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

  // next server action to submit vote
  // async function submit(params: any) {
  //   "use server";
  //   const { id } = params;
  //   const response = await fetch(`${baseUrl}/api/poll/${id}`, {
  //     method: "POST",
  //     body: JSON.stringify(params),
  //   });
  // }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const invalidRecord: Record<string, string> = formConfig.validator(
      values as any,
      poll.PollChoice
    );
    const invalidFields = Object.keys(invalidRecord);
    if (invalidFields.length > 0) {
      console.log("REMOVEREMOVE", invalidFields);
      invalidFields.forEach((field) => {
        form.setError(field, {
          type: "custom",
          message: invalidRecord[field],
        });
      });
      return;
    }
    // Ensure the form is valid before submitting
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
