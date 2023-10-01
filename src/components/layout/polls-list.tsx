import type { PollQuery } from "@/lib/types";
import { getPolls } from "@/services/polls";
import { ArrowDownWideNarrow, Crosshair } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

type PollsListProps = {
  title: string;
  params: PollQuery;
};

function ListSkeleton(props: PollsListProps) {
  const { title } = props;
  return (
    <div className="poll-list space-y-4">
      <div className="mb-2 text-xl font-bold p-3">{title}</div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-3 w-[75%] rounded-lg" />
        </div>
      ))}
    </div>
  );
}

async function List(props: PollsListProps) {
  const polls = await getPolls(props.params);
  const { title } = props;
  return (
    <div className="poll-list">
      <div className="mb-2 text-xl font-bold p-3">{title}</div>
      {polls.map((poll) => (
        <Link key={poll.id} href={`/poll/${poll.id}`}>
          <div className="group text-blue-500 hover:bg-accent rounded-lg p-3 flex flex-row justify-between">
            <div>
              <div className="font-bold mb-1 group-hover:text-primary-foreground">
                {poll.title}
              </div>
              <div className="text-sm mb-1 text-muted-foreground group-hover:text-primary-foreground">
                {poll.description}
              </div>
            </div>
            <div>
              {poll.voteType === "single" ? (
                <Crosshair />
              ) : (
                <ArrowDownWideNarrow />
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function PollsList(props: PollsListProps) {
  return (
    <div className="rounded-lg shadow-lg p-3 ">
      <Suspense fallback={<ListSkeleton {...props} />}>
        {/* @ts-expect-error Server Component */}
        <List {...props} />
      </Suspense>
    </div>
  );
}
