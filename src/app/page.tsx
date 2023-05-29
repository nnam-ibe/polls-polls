import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="m-2">
      <div className="flex justify-center">
        <Button asChild>
          <Link href="/poll/create">Create Poll</Link>
        </Button>
      </div>
    </div>
  );
}
