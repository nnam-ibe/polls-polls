import { Center } from "@/components/layout/center";
import { SingleResult } from "@/components/layout/vote/single-result";
import {
  ApiPollwSVotesSchema,
  IsSingleResult,
  SingleResultSchema,
} from "@/lib/types";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function fetchPoll(id: string) {
  return fetch(`${baseUrl}/api/poll/${id}/result`, {
    next: { revalidate: 60 },
  });
}

export default async function ResultPage({
  params,
}: {
  params: { id: string };
}) {
  const response = await fetchPoll(params.id);
  const rawResponse = await response.json();

  const isSingleResult = IsSingleResult.parse(rawResponse);
  const poll = ApiPollwSVotesSchema.parse(rawResponse.poll);
  // TODO: remove?
  // const poll = isSingleResult ? SingleResultSchema.parse(rawResult) : RankedResultSchema.parse(rawResult);

  if (isSingleResult) {
    const result = SingleResultSchema.parse(rawResponse.result);
    return (
      <Center>
        <div className="text-xl font-bold mb-1">{poll.title}</div>
        <div className="text-base italic mb-1">{poll.description}</div>
        <SingleResult poll={poll} result={result} />
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
  return <div>Ranked</div>;
}
