import { Container } from "@/components/ui/container";
import React from "react"

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="space-y-6 border-x px-4 pt-4 pb-6">
      {children}
    </Container>
  )
}
