import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Contribution Guidelines | OpenNotes",
  description:
    "Learn how to contribute high-quality educational notes to OpenNotes.",
}

export default function GuidelinesPage() {
  return (
    <LegalPage
      title="Contribution Guidelines"
      description="Help other students learn by sharing clear, useful, accurate, and well-organized educational resources."
      lastUpdated="August 2026"
      sections={[
        {
          title: "Quality Matters",
          content: (
            <p>
              Contributions should be readable, useful, and organized. Upload
              notes that another student can realistically use for learning or
              revision.
            </p>
          ),
          items: [
            "Use clear and readable documents.",
            "Avoid blurry, incomplete, or unnecessarily duplicated pages.",
            "Keep notes organized with meaningful headings and sections.",
            "Provide an accurate title and description.",
          ],
        },

        {
          title: "Choose Accurate Metadata",
          items: [
            "Select the correct subject.",
            "Select the appropriate educational level and grade.",
            "Choose the correct course when applicable.",
            "Use meaningful topics and tags.",
            "Provide the academic year when relevant.",
          ],
        },

        {
          title: "File Requirements",
          items: [
            "Upload supported educational document formats.",
            "Make sure the uploaded file opens correctly.",
            "Do not upload corrupted or password-protected files.",
            "Avoid unnecessarily large files.",
            "Do not upload files containing malicious software.",
          ],
        },

        {
          title: "Originality and Copyright",
          content: (
            <p>
              Only submit material that you created yourself or have permission
              to redistribute. Do not upload copyrighted textbooks, paid course
              materials, private institutional documents, or another person&lsquo;s
              work without appropriate permission.
            </p>
          ),
        },

        {
          title: "Respect Privacy",
          items: [
            "Do not upload personal documents containing private information.",
            "Remove phone numbers, addresses, email addresses, student IDs, and similar information when unnecessary.",
            "Do not publish examination materials that are confidential or restricted.",
          ],
        },

        {
          title: "Review Process",
          content: (
            <p>
              Contributions enter a review process before becoming publicly
              available. Administrators may approve, reject, request changes, or
              remove content that does not meet OpenNotes requirements.
            </p>
          ),
        },

        {
          title: "Why a Contribution May Be Rejected",
          items: [
            "Poor or unreadable quality.",
            "Incorrect metadata.",
            "Duplicate content.",
            "Copyright or ownership concerns.",
            "Spam or promotional content.",
            "Inappropriate or unsafe material.",
            "Incomplete or misleading information.",
          ],
        },

        {
          title: "Before You Submit",
          items: [
            "Check the title and description.",
            "Verify the subject and course.",
            "Verify grade and educational level.",
            "Review the document before uploading.",
            "Make sure you have permission to share the material.",
          ],
        },
      ]}
    />
  )
}
