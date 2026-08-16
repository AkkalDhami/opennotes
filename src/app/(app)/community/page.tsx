import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Community Guidelines | OpenNotes",
  description:
    "Learn how to participate respectfully in the OpenNotes community.",
}

export default function CommunityPage() {
  return (
    <LegalPage
      title="Community Guidelines"
      description="OpenNotes is built around students, educators, and contributors helping one another. These guidelines help keep the platform useful and respectful."
      lastUpdated="August 2026"
      sections={[
        {
          title: "Be Respectful",
          items: [
            "Treat other students, contributors, educators, and administrators respectfully.",
            "Do not harass, threaten, bully, or target other users.",
            "Disagreements are welcome, but personal attacks are not.",
          ],
        },

        {
          title: "Keep Contributions Educational",
          items: [
            "Focus shared materials on legitimate educational purposes.",
            "Avoid unrelated promotional or commercial content.",
            "Do not use OpenNotes primarily for advertising.",
          ],
        },

        {
          title: "Do Not Mislead Others",
          items: [
            "Do not intentionally upload incorrect information as fact.",
            "Do not misrepresent yourself as another contributor, educator, institution, or organization.",
            "Use accurate titles, descriptions, subjects, and educational levels.",
          ],
        },

        {
          title: "Respect Copyright",
          content: (
            <p>
              Sharing educational material does not automatically mean that you
              have permission to redistribute it. Respect copyright, licenses,
              institutional policies, and the rights of content creators.
            </p>
          ),
        },

        {
          title: "Protect Personal Information",
          items: [
            "Do not share another person's private information.",
            "Do not publish private conversations or confidential documents.",
            "Do not use the platform to collect personal information about other users.",
          ],
        },

        {
          title: "Spam and Abuse",
          items: [
            "Do not repeatedly submit duplicate content.",
            "Do not attempt to manipulate view or download counts.",
            "Do not use automated systems to abuse platform functionality.",
            "Do not upload malicious files or attempt to compromise the platform.",
          ],
        },

        {
          title: "Moderation",
          content: (
            <p>
              OpenNotes administrators may review reports and take action when
              content or behavior violates these guidelines. Actions may include
              removing content, rejecting contributions, limiting features, or
              suspending accounts depending on the severity and frequency of the
              violation.
            </p>
          ),
        },

        {
          title: "Report a Problem",
          content: (
            <p>
              If you encounter copyright violations, abusive behavior,
              inappropriate content, spam, or other serious problems, report the
              issue through the available OpenNotes contact or reporting
              mechanism.
            </p>
          ),
        },
      ]}
    />
  )
}
