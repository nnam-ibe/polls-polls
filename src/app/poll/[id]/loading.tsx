import { Center } from "@/components/layout/center";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Center>
      <div className="space-y-7">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[300px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-[52px] w-full" />
          <Skeleton className="h-[52px] w-full" />
          <Skeleton className="h-[52px] w-full" />
          <Skeleton className="h-[52px] w-full" />
        </div>
        <div>
          <Skeleton className="h-[40px] w-full" />
        </div>
      </div>
    </Center>
  );
}
