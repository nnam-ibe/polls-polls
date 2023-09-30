import { Center } from "@/components/layout/center";
import { RankedResult } from "@/components/layout/vote/ranked-result";
import { SingleResult } from "@/components/layout/vote/single-result";
import { getPollResult } from "@/services/polls/result";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

function fetchPoll(id: string) {
  return getPollResult(id);
}

export default async function ResultPage({
  params,
}: {
  params: { id: string };
}) {
  const { poll, result } = await fetchPoll(params.id);

  return (
    <Center>
      <div className="text-xl font-bold mb-1">{poll.title}</div>
      <div className="text-base italic mb-1">{poll.description}</div>
      {result.voteType === "single" ? (
        <SingleResult poll={poll} result={result} />
      ) : (
        <RankedResult poll={poll} result={result} />
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
