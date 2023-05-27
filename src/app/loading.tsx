import { Spinner } from "../components/spinner/";

export default function Loading() {
  return (
    <div className="flex flex-1 justify-center items-center h-screen">
      <Spinner className="w-12 h-12 text-blue-600" />
    </div>
  );
}
