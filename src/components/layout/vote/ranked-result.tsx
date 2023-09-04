import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PollWChoices, RankedResult } from "@/lib/types";
import keyBy from "lodash/keyBy";

type RankedResultProps = {
  poll: PollWChoices;
  result: RankedResult;
};

export function RankedResult(props: RankedResultProps) {
  const { result, poll } = props;
  const pollChoicesById = keyBy(poll.PollChoices, "id");
  const pollChoiceIds = Object.keys(pollChoicesById);

  return (
    <div className="flex flex-col gap-10">
      {result.stages.map((stage, idx) => {
        const stageNumber = idx + 1;
        const tableCaption = `Stage ${stageNumber} (${result.threshold} votes needed to win)`;
        const stageResult = pollChoiceIds
          .map((choiceId) => {
            return {
              choiceId,
              votes: stage.tallyCount[choiceId],
            };
          })
          .sort((a, b) => b.votes - a.votes);

        return (
          <Table key={stageNumber}>
            <TableCaption>{tableCaption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Choice</TableHead>
                <TableHead className="text-right">Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stageResult.map(({ choiceId, votes }) => (
                <TableRow key={choiceId}>
                  <TableCell
                    className={
                      result.winner === choiceId ? "font-bold" : "font-medium"
                    }
                  >
                    {pollChoicesById[choiceId].title}
                  </TableCell>
                  <TableCell className="text-right">
                    {stage.tallyCount[choiceId]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      })}
    </div>
  );

  return <div>Ranked Result Component</div>;
}
