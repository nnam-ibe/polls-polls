import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PollWChoices, SingleResult } from "@/lib/types";
import { twMerge } from "tailwind-merge";
import { cellTextStyles } from "./styles";

type SingleResultProps = {
  poll: PollWChoices;
  result: SingleResult;
};

export function SingleResult(props: SingleResultProps) {
  const { result, poll } = props;
  const choices = Object.keys(result.tally);
  const choiceTitles: Record<string, string> = {};
  poll.PollChoices.forEach((choice) => {
    choiceTitles[choice.id] = choice.title;
  });
  choices.sort((a, b) => result.tally[b] - result.tally[a]);

  const tableCaption = `(${result.threshold} / ${result.numberOfVotes}) votes needed to win`;

  return (
    <Table>
      <TableCaption>{tableCaption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Choice</TableHead>
          <TableHead className="text-right">Votes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {choices.map((choice) => (
          <TableRow key={choice}>
            <TableCell
              className={
                result.winner === choice
                  ? cellTextStyles.winner
                  : cellTextStyles.losers
              }
            >
              {choiceTitles[choice]}
            </TableCell>
            <TableCell
              className={twMerge(
                "text-right",
                result.winner === choice
                  ? cellTextStyles.winner
                  : cellTextStyles.losers
              )}
            >
              {result.tally[choice]}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
