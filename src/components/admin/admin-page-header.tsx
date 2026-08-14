interface UsersPageHeaderProps {
  title: string
  description: string
}

export function AdminPageHeader({ title, description }: UsersPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h1 className="relative inline text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="text-sm max-w-xl text-muted-foreground">{description}</p>
    </div>
  )
}
