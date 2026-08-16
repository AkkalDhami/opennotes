interface UsersPageHeaderProps {
  title: string
  description: string
}

export function AdminPageHeader({ title, description }: UsersPageHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="relative inline text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
