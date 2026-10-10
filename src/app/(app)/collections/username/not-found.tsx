import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Route } from "next"
export default function NotFound() {
  return (
    <Container>
      <h2 className="font-serif text-2xl">Collection not found.</h2>
      <p className="text-muted-foreground">
        This collection may have been removed or the link may be incorrect.
      </p>
      <Button
        nativeButton={false}
        render={<Link href={"/collections" as Route}>Browse collections</Link>}
      />
    </Container>
  )
}
