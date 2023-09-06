"use client";
import { Center } from "@/components/layout/center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { useToast } from "@/components/ui/use-toast";
import type { PollWChoices } from "@/lib/types";
import {
  ApiErrorSchema,
  ApiPollwChoicesSchema,
  PollEditSchema,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducer } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const choiceMaxLength = 32;

type EditPollState = {
  existingChoices: PollWChoices["PollChoices"];
  pollChoices: Set<string>;
  isLoading: boolean;
};

type EditPollAction =
  | { type: "addChoice" | "removeChoice"; payload: Set<string> }
  | { type: "updateExistingChoices"; payload: PollWChoices["PollChoices"] }
  | {
      type: "submitPoll" | "submitPollSuccess" | "submitPollError";
    };

type ChoicesUpdate = {
  id?: string;
  title: string;
}[];

const editPollReducer = (
  state: EditPollState,
  action: EditPollAction
): EditPollState => {
  switch (action.type) {
    case "addChoice":
      return {
        ...state,
        pollChoices: action.payload,
      };
    case "updateExistingChoices":
      return {
        ...state,
        existingChoices: action.payload,
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

function EditPoll(props: { poll: PollWChoices }) {
  const { poll } = props;
  const [state, dispatch] = useReducer(editPollReducer, {
    existingChoices: poll.PollChoices,
    pollChoices: new Set<string>(),
    isLoading: false,
  });
  const existingDefaults = poll.PollChoices.reduce<Record<string, string>>(
    (acc, choice) => {
      acc[choice.id] = choice.title;
      return acc;
    },
    {}
  );
  const existingChoiceIds = Object.keys(existingDefaults);
  const existingSchema = existingChoiceIds.reduce<Record<string, z.ZodString>>(
    (acc, choiceId) => {
      acc[choiceId] = z.string().max(choiceMaxLength);
      return acc;
    },
    {}
  );
  const formSchema = z.object({
    title: z.string().min(1).max(32),
    description: z.string().max(64),
    currentChoice: z.string().max(choiceMaxLength),
    ...existingSchema,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: poll.title,
      description: poll.description || "",
      currentChoice: "",
      ...existingDefaults,
    },
  });
  const router = useRouter();
  const { toast } = useToast();

  const { pollChoices, isLoading } = state;

  async function onSubmit(values: Record<string, string>) {
    const numChoices = state.existingChoices.length + pollChoices.size;
    if (numChoices < 2) {
      form.setError("currentChoice", {
        type: "custom",
        message: "At least 2 options are required",
      });
      return;
    }

    const existingChoicesUpdate = existingChoiceIds.reduce<ChoicesUpdate>(
      (acc, choiceId) => {
        if (values[choiceId]) {
          acc.push({
            id: choiceId,
            title: values[choiceId],
          });
        }
        return acc;
      },
      []
    );
    const choices = [
      ...existingChoicesUpdate,
      ...Array.from(pollChoices).map((cTitle) => ({
        title: cTitle,
      })),
    ];

    const editData = PollEditSchema.parse({
      ...values,
      choices,
    });

    try {
      dispatch({ type: "submitPoll" });
      await editPoll(poll.id, editData);

      dispatch({ type: "submitPollSuccess" });
      toast({ title: "Poll Updated!" });
      router.push(`/poll/${poll.id}`);
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

  function deleteExistingChoice(choiceId: string) {
    const newChoices = state.existingChoices.filter(
      (choice) => choice.id !== choiceId
    );
    dispatch({ type: "updateExistingChoices", payload: newChoices });
  }

  return (
    <Center>
      <div className="text-xl font-bold mb-1">Edit Poll</div>

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
          <div className="text-sm font-semibold">Update Poll Choices</div>
          {state.existingChoices.map((choice) => {
            return (
              <FormInput
                key={choice.id}
                control={form.control}
                name={choice.id}
                placeholder="Monday"
                rightAddOn={
                  <Button
                    className="rounded-l-none"
                    type="button"
                    onClick={() => deleteExistingChoice(choice.id)}
                    variant="destructive"
                  >
                    <Trash2 />
                  </Button>
                }
              />
            );
          })}
          <FormInput
            control={form.control}
            name="currentChoice"
            label="New Poll Choices"
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

          <div className="text-sm">
            <span className="font-semibold">Vote Type: </span>
            {poll.voteType === "ranked" ? "Ranked Vote" : "Single Vote"}
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="secondary"
            loading={isLoading}
          >
            Edit poll
          </Button>
        </form>
      </Form>
      <Link
        href={`/poll/${poll.id}`}
        className="flex items-center text-blue-500 py-2"
      >
        <MoveLeft className="inline" />
        <span className="ml-2">Back to Poll</span>
      </Link>
    </Center>
  );
}

async function editPoll(pollId: string, data: any) {
  const response = await fetch(`/api/poll/${pollId}/edit`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response;
}

function fetchPoll(id: string) {
  return fetch(`${baseUrl}/api/poll/${id}`, {
    next: { revalidate: 30 },
  });
}

export default async function EditPollPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetchPoll(params.id);
  const resData = await res.json();
  const poll = ApiPollwChoicesSchema.parse(resData);
  return <EditPoll poll={poll} />;
}
