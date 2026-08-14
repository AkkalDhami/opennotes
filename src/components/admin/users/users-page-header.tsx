interface UsersPageHeaderProps {
  total: number
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function UsersPageHeader({ total }: UsersPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl inline relative font-medium tracking-tight text-foreground sm:text-3xl">
        Users <span className="absolute flex items-center justify-center rounded-full top-0 left-22 bg-brand text-background p-1 size-6 text-sm">{numberFormatter.format(total)}</span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Manage registered users and their accounts.
      </p>
    </div>
  )
}
