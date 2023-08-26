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
              className={result.winner === choice ? "font-bold" : "font-medium"}
            >
              {choiceTitles[choice]}
            </TableCell>
            <TableCell className="text-right">{result.tally[choice]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
