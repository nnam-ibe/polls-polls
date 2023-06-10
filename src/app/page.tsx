import { PollsList } from "@/components/layout/polls-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="m-4 flex flex-col gap-3">
      <div className="flex justify-center">
        <Button asChild>
          <Link href="/poll/create">Create Poll</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <PollsList title="Open Polls" />
      </div>
    </div>
  );
}
