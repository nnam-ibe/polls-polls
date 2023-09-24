import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { faPoll } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex flex-row items-center bg-primary text-primary-foreground px-3 h-[--navbar-height] shadow-lg shadow-primary/50">
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
          <SignInButton />
        </SignedOut>
      </div>
    </nav>
  );
}
