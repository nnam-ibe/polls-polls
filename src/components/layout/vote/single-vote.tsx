import { StyledFormRadioGroup } from "@/components/ui/form-radio-group";
import { PollWChoices } from "@/lib/types";
import { useFormContext } from "react-hook-form";
import * as z from "zod";

type SingleVoteProps = {
  poll: PollWChoices;
};

function validator(values: string, options: PollWChoices["PollChoice"]) {
  return {};
}

export function formConfig() {
  const singleVoteFormSchema = z.object({
    vote: z.string().min(1),
  });

  const defaultValues = { vote: "" };

  return { schema: singleVoteFormSchema, defaultValues, validator };
}

export function SingleVote(props: SingleVoteProps) {
  const { poll } = props;
  const form = useFormContext();
  const watchVote = form.watch("vote");

  const options = poll.PollChoice.map((choice) => ({
    value: choice.id,
    label: choice.title,
  }));

  return (
    <StyledFormRadioGroup
      control={form.control}
      name="vote"
      label=""
      options={options}
      value={watchVote}
    />
  );
}
