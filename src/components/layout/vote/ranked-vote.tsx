import { PollWChoices } from "@/lib/types";
import * as z from "zod";
import { useFormContext } from "react-hook-form";
import { FormSelect } from "@/components/ui/form-select";
import { toOrdinalNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type RankedVoteProps = {
  poll: PollWChoices;
};

export const rankedVoteFormSchema = z.object({
  vote: z.map(z.string(), z.string()),
});

export const rankedFormDefaultValues = {
  vote: "",
};

export function getFormDefaultsAndSchema(poll: PollWChoices) {
  const defaultValues: Record<string, string | null> = {};
  const zSchema: Record<string, z.ZodType<string | null>> = {};

  const optionIds = poll.PollChoice.map((choice) => choice.id);

  optionIds.forEach((_, index) => {
    defaultValues[index] = "";

    zSchema[index] = index === 0 ? z.string().min(1) : z.string().nullable();
  });

  const schema = z.object(zSchema);

  return { schema, defaultValues };
}

export function RankedVote(props: RankedVoteProps) {
  const { poll } = props;
  const form = useFormContext();
  const watchVote = form.watch("vote");

  const options = poll.PollChoice.map((choice) => ({
    value: choice.id,
    label: choice.title,
  }));

  return (
    <div className="py-3 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {poll.PollChoice.map((choice) => (
          <Badge key={choice.id}>{choice.title}</Badge>
        ))}
      </div>
      {Array.from({ length: poll.PollChoice.length }, (_, index) => {
        return (
          <FormSelect
            key={index}
            name={index.toString()}
            label={`${toOrdinalNumber(index + 1)} Choice`}
            options={options}
            control={form.control}
            placeholder="Select an option"
            isRequired={index === 0}
          />
        );
      })}
    </div>
  );
}
