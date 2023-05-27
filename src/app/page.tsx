import Image from "next/image";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="m-2">
      <div className="flex justify-center">
        <Button size="lg" variant="outline">
          New Poll
        </Button>
      </div>
    </div>
  );
}
