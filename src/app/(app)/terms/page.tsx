import { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service | OpenNotes",
  description: "Read the terms and conditions governing the use of OpenNotes.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms explain the rules for using OpenNotes, contributing educational materials, and accessing content shared by the community."
      lastUpdated="August 2026"
      sections={[
        {
          title: "Acceptance of Terms",
          content: (
            <p>
              By accessing or using OpenNotes, you agree to comply with these
              Terms of Service and applicable laws. If you do not agree with
              these terms, please do not use the platform.
            </p>
          ),
        },

        {
          title: "About OpenNotes",
          content: (
            <p>
              OpenNotes is an educational platform that allows users to
              discover, view, download, and contribute educational notes and
              study materials.
            </p>
          ),
        },

        {
          title: "User Accounts",
          items: [
            "You are responsible for maintaining the security of your account.",
            "You must provide accurate information when creating or updating your account.",
            "You must not impersonate another person or create an account using misleading information.",
            "You are responsible for activity performed through your account.",
          ],
        },

        {
          title: "User Contributions",
          content: (
            <p>
              Users may submit educational notes and other materials to
              OpenNotes. Submitted content may be reviewed before publication.
              By submitting content, you confirm that you have the necessary
              rights or permission to share it.
            </p>
          ),
        },

        {
          title: "Content Ownership",
          content: (
            <p>
              You retain ownership of content you submit where applicable.
              However, by submitting content to OpenNotes, you grant OpenNotes
              the permission necessary to store, process, display, distribute,
              and make that content available through the platform.
            </p>
          ),
        },

        {
          title: "Prohibited Content",
          items: [
            "Content that infringes copyright or other intellectual property rights.",
            "Content containing malware, malicious code, or harmful files.",
            "Fraudulent, misleading, or intentionally deceptive educational materials.",
            "Harassing, hateful, threatening, or abusive content.",
            "Private or confidential information belonging to another person.",
            "Content that violates applicable laws or regulations.",
          ],
        },

        {
          title: "Content Moderation",
          content: (
            <p>
              OpenNotes may review, reject, restrict, remove, or modify
              submitted content when it violates these terms, community
              guidelines, or applicable law. We may also restrict accounts
              involved in repeated or serious violations.
            </p>
          ),
        },

        {
          title: "Copyright Complaints",
          content: (
            <p>
              If you believe content available on OpenNotes infringes your
              copyright, please contact the platform with sufficient information
              to identify the material and establish your rights. Reported
              content may be temporarily or permanently removed while the issue
              is reviewed.
            </p>
          ),
        },

        {
          title: "Availability",
          content: (
            <p>
              OpenNotes is provided on an availability basis. We may temporarily
              suspend or modify features for maintenance, security,
              improvements, or other operational reasons.
            </p>
          ),
        },

        {
          title: "Limitation of Liability",
          content: (
            <p>
              To the extent permitted by applicable law, OpenNotes is not
              responsible for losses resulting from reliance on user-submitted
              educational materials, temporary service interruptions, or
              unauthorized use of accounts.
            </p>
          ),
        },

        {
          title: "Changes to These Terms",
          content: (
            <p>
              We may update these terms as OpenNotes evolves. Updated terms will
              be published on this page with a revised effective date.
            </p>
          ),
        },
      ]}
    />
  )
}
