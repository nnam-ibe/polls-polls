import { Badge } from "@/components/ui/badge";
import { FormSelect } from "@/components/ui/form-select";
import type { PollWChoices } from "@/lib/types";
import { toOrdinalNumber } from "@/lib/utils";
import { useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";

type RankedVoteProps = {
  poll: PollWChoices;
};

function validator(
  values: Record<string, string | null>,
  options: PollWChoices["PollChoices"]
) {
  const chosenOptions = new Map<string, string>();
  const errors: Record<string, string> = {};
  let lastOptionWithValue = options.length;

  Array.from({ length: options.length }, (_, index) => {
    const indexString = index.toString();
    const optionValue = values[indexString];
    if (!optionValue) {
      lastOptionWithValue = index;
      return;
    }

    if (index > lastOptionWithValue) {
      errors[lastOptionWithValue] = "Cannot skip a rank";
      return;
    }

    if (chosenOptions.has(optionValue)) {
      errors[indexString] = "Ranked more than once";
      errors[chosenOptions.get(optionValue)!] = "Ranked more than once";
    }

    chosenOptions.set(optionValue, indexString);
  });

  return errors;
}

export function formConfig(poll: PollWChoices) {
  const defaultValues: Record<string, string | null> = {};
  const zSchema: Record<string, z.ZodType<string | null>> = {};

  const optionIds = poll.PollChoices.map((choice) => choice.id);

  optionIds.forEach((_, index) => {
    defaultValues[index] = "";

    zSchema[index] =
      index === 0
        ? z.string().min(1, { message: "1st choice required" })
        : z.string().nullable();
  });

  const schema = z.object(zSchema);

  return { schema, defaultValues, validator };
}

export function RankedVote(props: RankedVoteProps) {
  const { poll } = props;
  const form = useFormContext();
  const selectedValues = form.watch();

  const options = poll.PollChoices.map((choice) => ({
    value: choice.id,
    label: choice.title,
  }));

  return (
    <div className="py-3 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {poll.PollChoices.map((choice) => (
          <Badge key={choice.id}>{choice.title}</Badge>
        ))}
      </div>
      {Array.from({ length: poll.PollChoices.length }, (_, index) => {
        return (
          <FormSelect
            key={index}
            name={index.toString()}
            label={`${toOrdinalNumber(index + 1)} Choice`}
            options={options}
            control={form.control}
            placeholder="Select an option"
            isRequired={index === 0}
            selectedValues={Object.values(selectedValues)}
          />
        );
      })}
    </div>
  );
}
