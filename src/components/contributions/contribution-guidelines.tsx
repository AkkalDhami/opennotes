"use client"

import { motion } from "motion/react"
import {
  AlertCircleIcon,
  BookOpen02Icon,
  CheckmarkCircle02Icon,
  File02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Idea01Icon from "@hugeicons/core-free-icons/Idea01Icon";

const guidelines = [
  {
    icon: Shield01Icon,
    title: "Quality Matters",
    description:
      "Upload clear, readable, and well-organized notes that are useful for other students.",
  },
  {
    icon: File02Icon,
    title: "File Requirements",
    description:
      "Upload a clear PDF document. Make sure the file opens correctly and is easy to read.",
  },
  {
    icon: BookOpen02Icon,
    title: "Accurate Information",
    description:
      "Make sure your notes contain accurate academic information and are properly categorized.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "Original Content",
    description:
      "Only submit notes you have the right to share. Do not upload copyrighted material without permission.",
  },
  {
    icon: AlertCircleIcon,
    title: "Review Process",
    description:
      "Every submission is reviewed by our team before it becomes publicly available on OpenNotes.",
  },
]

export function ContributionGuidelines() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-1"
    >
      <Card className="sticky top-8 bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Idea01Icon}
              className="size-5"
              strokeWidth={2}
            />
            Contribution Guidelines
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            A few things to keep in mind before sharing your notes.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-4">
            {guidelines.map((guideline) => (
              <div key={guideline.title} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <HugeiconsIcon
                    icon={guideline.icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-semibold">{guideline.title}</h4>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {guideline.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Alert>
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-4"
              strokeWidth={2}
            />

            <AlertDescription className="text-sm">
              By submitting a note, you confirm that the information is accurate
              and that you have the right to share the content.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  )
}
