import { BotIcon } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="py-6 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BotIcon className="h-8 w-8" />
          <h1 className="text-3xl font-headline font-bold">
            ArbiSmart
          </h1>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
}
