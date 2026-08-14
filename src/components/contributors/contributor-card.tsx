import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Contributor } from "@/types/contributor";

const ROLE_LABEL: Record<NonNullable<Contributor["role"]>, string> = {
  student: "Student",
  teacher: "Teacher",
  contributor: "Contributor",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface ContributorCardProps {
  contributor: Contributor;
  className?: string;
}

export function ContributorCard({
  contributor,
  className,
}: ContributorCardProps) {
  const { name, username, role, subject, notesCount, avatarUrl, verified } =
    contributor;

  const roleLine = [role ? ROLE_LABEL[role] : null, subject]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/contributors/${username}`}
      aria-label={`View ${name}'s contributor profile`}
      className={cn(
        "group flex min-w-60 flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <Avatar className="size-18 text-base">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback aria-hidden={!!avatarUrl}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <p className="font-medium text-card-foreground">{name}</p>
          {verified ? (
            <Badge variant="secondary" className="text-[10px]">
              Verified
            </Badge>
          ) : null}
        </div>
        {roleLine ? (
          <p className="text-sm text-muted-foreground">{roleLine}</p>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        {notesCount} {notesCount === 1 ? "note" : "notes"} shared
      </p>

      <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
        View profile
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={16}
          strokeWidth={2}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
