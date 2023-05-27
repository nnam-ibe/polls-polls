import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPoll } from "@fortawesome/free-solid-svg-icons";

export default function Head() {
  return (
    <>
      <title>Polls Polls Polls!</title>
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <link rel="icon" href="/favicon.ico" />
      <FontAwesomeIcon icon={faPoll} />
    </>
  );
}
