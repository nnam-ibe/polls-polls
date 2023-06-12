"use client";
import { Center } from "@/components/layout/center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormRadioGroup } from "@/components/ui/form-radio-group";
import { useToast } from "@/components/ui/use-toast";
import { ApiErrorSchema, CreatePollResultSchema } from "@/lib/types";
import { useClerk } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useReducer } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const choiceMaxLength = 32;
const formSchema = z.object({
  title: z.string().min(1).max(32),
  description: z.string().max(64),
  currentChoice: z.string().max(choiceMaxLength),
  voteType: z.enum(["single", "ranked"]),
});

type CreatePollState = {
  pollChoices: Set<string>;
  isLoading: boolean;
};

type CreatePollAction =
  | { type: "addChoice" | "removeChoice"; payload: Set<string> }
  | {
      type: "submitPoll" | "submitPollSuccess" | "submitPollError";
    };

const createPollReducer = (
  state: CreatePollState,
  action: CreatePollAction
): CreatePollState => {
  switch (action.type) {
    case "addChoice":
      return {
        ...state,
        pollChoices: action.payload,
      };
    case "removeChoice":
      return {
        ...state,
        pollChoices: action.payload,
      };
    case "submitPoll":
      return {
        ...state,
        isLoading: true,
      };
    case "submitPollSuccess":
      return {
        ...state,
        isLoading: false,
      };
    case "submitPollError":
      return {
        ...state,
        isLoading: false,
      };
    default:
      throw new Error("Invalid action type");
  }
};

export default function CreatePoll() {
  const [state, dispatch] = useReducer(createPollReducer, {
    pollChoices: new Set<string>(),
    isLoading: false,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      currentChoice: "",
      voteType: "ranked",
    },
  });
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useClerk();

  const { pollChoices, isLoading } = state;

  async function createPoll(data: any) {
    if (user) {
      data.createdBy = user.id;
    }
    const response = await fetch("/api/poll", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (pollChoices.size < 2) {
      form.setError("currentChoice", {
        type: "custom",
        message: "At least 2 options are required",
      });
      return;
    }

    try {
      dispatch({ type: "submitPoll" });
      const response = await createPoll({
        ...values,
        choices: Array.from(pollChoices),
      });

      const result = CreatePollResultSchema.parse(await response.json());
      dispatch({ type: "submitPollSuccess" });
      toast({ title: "Poll Created!" });
      router.push(`/poll/${result.id}`);
    } catch (error) {
      const { message } = ApiErrorSchema.parse(error);
      dispatch({ type: "submitPollError" });
      toast({ description: message, variant: "destructive" });
    }
  }

  function handleChoiceAdd() {
    const currentChoice = form.getValues("currentChoice");
    if (currentChoice.length === 0) return;

    const newChoices = new Set(pollChoices);

    const itemsToAdd: string[] = currentChoice
      .split(",")
      .map((item) => item.trim());
    itemsToAdd.forEach((item) => {
      if (item.length === 0) return;
      // TODO: show error message
      if (item.length > choiceMaxLength) return;
      if (newChoices.has(item)) return;

      newChoices.add(item);
    });

    dispatch({ type: "addChoice", payload: newChoices });
    form.setValue("currentChoice", "");
    form.trigger("currentChoice");
  }

  function handleRemoveChoice(choice: string) {
    const newChoices = new Set(pollChoices);
    newChoices.delete(choice);
    dispatch({ type: "removeChoice", payload: newChoices });
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
            isRequired={true}
          />
          <FormInput
            control={form.control}
            name="description"
            label="Poll Description"
            placeholder="Does the week start on Monday or Sunday"
            helpText="Description/Subtitle for more context"
          />
          <FormInput
            control={form.control}
            name="currentChoice"
            label="Poll Choices"
            placeholder="Monday, Sunday"
            helpText="Choices to vote on"
            rightAddOn={
              <Button
                className="rounded-l-none"
                type="button"
                onClick={handleChoiceAdd}
                variant="secondary"
              >
                Add Choice
              </Button>
            }
            isRequired={true}
          />
          <div className="flex flex-wrap gap-0.5">
            {Array.from(pollChoices).map((choice) => (
              <Badge key={choice} onClick={() => handleRemoveChoice(choice)}>
                {choice}
              </Badge>
            ))}
          </div>
          <FormRadioGroup
            control={form.control}
            name="voteType"
            label="Vote Type"
            isRequired={true}
            options={[
              { value: "ranked", label: "Ranked Vote" },
              { value: "single", label: "Single Vote" },
            ]}
          />

          <Button
            type="submit"
            className="w-full"
            variant="secondary"
            loading={isLoading}
          >
            Create Poll
          </Button>
        </form>
      </Form>
    </Center>
  );
}
