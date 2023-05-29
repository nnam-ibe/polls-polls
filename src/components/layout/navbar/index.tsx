import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPoll } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex flex-row items-center bg-primary text-primary-foreground px-3 h-[--navbar-height]">
      <div className="mr-auto">
        <Link href="/">
          <FontAwesomeIcon icon={faPoll} size="2x" color="white" />
        </Link>
      </div>
      <div className="ml-auto">
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <p>Signed out</p>
        </SignedOut>
      </div>
    </nav>
  );
}
