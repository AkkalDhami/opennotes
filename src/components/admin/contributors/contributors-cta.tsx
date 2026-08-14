"use client"

import { motion } from "motion/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ContributorsCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Have notes to share?
          </h2>
          <p className="max-w-md text-muted-foreground">
            Help another student learn by sharing your notes with the community.
          </p>
          <Button
          nativeButton={false}
            render={<Link href="/contribution">Share Your Notes</Link>}
            size="lg"
            className="mt-2"
          ></Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
