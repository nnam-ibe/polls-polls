import { Center } from "@/components/layout/center";
import { RankedResult } from "@/components/layout/vote/ranked-result";
import { SingleResult } from "@/components/layout/vote/single-result";
import {
  ApiPollwChoicesSchema,
  IsSingleResult,
  RankedResultSchema,
  SingleResultSchema,
} from "@/lib/types";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

function fetchPoll(id: string) {
  return fetch(`${baseUrl}/api/poll/${id}/result`, {
    next: { revalidate: 30 },
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
  const poll = ApiPollwChoicesSchema.parse(rawResponse.poll);

  return (
    <Center>
      <div className="text-xl font-bold mb-1">{poll.title}</div>
      <div className="text-base italic mb-1">{poll.description}</div>
      {isSingleResult ? (
        <SingleResult
          poll={poll}
          result={SingleResultSchema.parse(rawResponse.result)}
        />
      ) : (
        <RankedResult
          poll={poll}
          result={RankedResultSchema.parse(rawResponse.result)}
        />
      )}
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
