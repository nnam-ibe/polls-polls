import Loading from "@/app/poll/[id]/loading";
import { PollComponent } from "@/components/layout/vote/vote";
import { getPoll } from "@/services/polls";
import { Suspense } from "react";

export default async function PollPage({ params }: { params: { id: string } }) {
  const poll = await getPoll(params.id);

  return (
    <Suspense fallback={<Loading />}>
      <PollComponent poll={poll} />;
    </Suspense>
  );
}
