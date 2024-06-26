import { StyledFormRadioGroup } from "@/components/ui/form-radio-group";
import { PollWChoices } from "@/lib/types";
import { useFormContext } from "react-hook-form";
import * as z from "zod";

type SingleVoteProps = {
  poll: PollWChoices;
};

function validator(values: string, options: PollWChoices["PollChoices"]) {
  return {};
}

export function formConfig() {
  const singleVoteFormSchema = z.object({
    pollChoiceId: z.string().min(1),
  });

  const defaultValues = { pollChoiceId: "" };

  return { schema: singleVoteFormSchema, defaultValues, validator };
}

export function SingleVote(props: SingleVoteProps) {
  const { poll } = props;
  const form = useFormContext();
  const watchVote = form.watch("pollChoiceId");

  const options = poll.PollChoices.map((choice) => ({
    value: choice.id,
    label: choice.title,
  }));

  return (
    <StyledFormRadioGroup
      control={form.control}
      name="pollChoiceId"
      label=""
      options={options}
      value={watchVote}
    />
  );
}
