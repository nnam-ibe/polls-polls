import { PollWChoices } from "@/lib/types";
import * as z from "zod";
import { useFormContext } from "react-hook-form";
import {
  StyledFormRadioGroup,
  FormRadioGroup,
} from "@/components/ui/form-radio-group";

type SingleVoteProps = {
  poll: PollWChoices;
};

export const singleVoteFormSchema = z.object({
  vote: z.string().min(1),
});

export const singleFormDefaultValues = {
  vote: "",
};

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
