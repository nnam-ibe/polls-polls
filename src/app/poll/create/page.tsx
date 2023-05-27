"use client";
import { Center } from "@/components/layout/center";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormRadioGroup } from "@/components/ui/form-radio-group";
import { FormActionInput } from "@/components/ui/form-action-input";

const choiceMaxLength = 32;
const formSchema = z.object({
  title: z.string().min(1).max(32),
  description: z.string().max(32),
  currentChoice: z.string().max(choiceMaxLength),
  pollChoices: z.array(z.string().min(2).max(choiceMaxLength)).max(15),
  voteType: z.enum(["single", "ranked"]),
});

export default function CreatePoll() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      currentChoice: "",
      pollChoices: [],
      voteType: "ranked",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  function handleChoiceAdd() {
    const currentChoice = form.getValues("currentChoice");
    const pollChoices = form.getValues("pollChoices");
    if (currentChoice.length === 0) return;

    const itemsToAdd: string[] = currentChoice
      .split(",")
      .map((item) => item.trim());
    const itemsToAddFiltered = itemsToAdd.filter((item) => {
      if (item.length === 0) return false;
      if (item.length > choiceMaxLength) return false;
      if (pollChoices.includes(item)) return false;

      pollChoices.push(item);
      return true;
    });

    form.setValue("pollChoices", pollChoices);
    form.setValue("currentChoice", "");
  }

  return (
    <Center>
      <div className="text-xl font-bold mb-1">Create a Poll</div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            control={form.control}
            name="title"
            label="Poll Title"
            placeholder="First day of the week"
            helpText="Title of the poll"
          />
          <FormInput
            control={form.control}
            name="description"
            label="Poll Description"
            placeholder="Does the week start on Monday or Sunday"
            helpText="Description/Subtitle for more context"
          />
          <FormActionInput
            control={form.control}
            name="pollChoices"
            inputName="currentChoice"
            label="Poll Choices"
            placeholder="Monday, Sunday"
            helpText="Choices to vote on"
            onActionClick={handleChoiceAdd}
          />
          <FormRadioGroup
            control={form.control}
            name="voteType"
            label="Vote Type"
            options={[
              { value: "ranked", label: "Ranked Vote" },
              { value: "single", label: "Single Vote" },
            ]}
          />

          <Button type="submit" className="w-full">
            Create Poll
          </Button>
        </form>
      </Form>
    </Center>
  );
}
