interface UsersPageHeaderProps {
  total: number
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function UsersPageHeader({ total }: UsersPageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="relative inline text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        Users{" "}
        <span className="absolute top-0 left-22 flex size-6 items-center justify-center rounded-full bg-foreground p-1 text-sm text-accent">
          {numberFormatter.format(total)}
        </span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Manage registered users and their accounts.
      </p>
    </div>
  )
}
