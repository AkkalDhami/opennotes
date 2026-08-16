import { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy | OpenNotes",
  description:
    "Learn how OpenNotes collects, uses, stores, and protects user information.",
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what information OpenNotes collects and how that information is used to operate and improve the platform."
      lastUpdated="August 2026"
      sections={[
        {
          title: "Information We Collect",
          items: [
            "Account information such as your name, email address, username, and profile information.",
            "Authentication information provided through supported sign-in providers.",
            "Educational content and metadata you voluntarily submit.",
            "Information about how you interact with notes and platform features.",
            "Technical information such as browser, device, IP-derived security information, and request data where necessary for operating the service.",
          ],
        },

        {
          title: "How We Use Information",
          items: [
            "To create and manage your OpenNotes account.",
            "To authenticate users and protect accounts.",
            "To process and publish educational contributions.",
            "To display contributor information associated with published notes.",
            "To measure note views and downloads.",
            "To detect abuse, fraud, spam, and security threats.",
            "To improve the reliability and functionality of OpenNotes.",
          ],
        },

        {
          title: "Public Contributor Information",
          content: (
            <p>
              When you contribute a note that is approved and published, certain
              information such as your display name or username may be shown
              alongside the contribution. Do not include private or sensitive
              information in your public profile or submitted notes.
            </p>
          ),
        },

        {
          title: "Uploaded Files",
          content: (
            <p>
              Files submitted through OpenNotes may be stored using third-party
              infrastructure providers required to operate the service. Files
              may be processed for validation, storage, preview, and delivery.
            </p>
          ),
        },

        {
          title: "Cookies and Sessions",
          content: (
            <p>
              OpenNotes may use cookies or similar technologies to maintain
              authentication sessions, protect accounts, remember preferences,
              and provide essential platform functionality.
            </p>
          ),
        },

        {
          title: "Analytics and Usage Data",
          content: (
            <p>
              We may collect aggregated information about how the platform is
              used, including note views, downloads, searches, and general
              feature usage. This helps us understand which educational
              resources are useful and improve the service.
            </p>
          ),
        },

        {
          title: "Data Security",
          content: (
            <p>
              We use reasonable technical and organizational measures to protect
              information. However, no internet-based service can guarantee
              absolute security.
            </p>
          ),
        },

        {
          title: "Third-Party Services",
          content: (
            <p>
              OpenNotes may rely on third-party providers for authentication,
              file storage, infrastructure, analytics, email, or other
              operational services. These providers may process information
              according to their own policies and applicable agreements.
            </p>
          ),
        },

        {
          title: "Data Retention",
          content: (
            <p>
              We retain information for as long as reasonably necessary to
              provide the service, meet legitimate operational requirements,
              resolve disputes, prevent abuse, and comply with applicable
              obligations.
            </p>
          ),
        },

        {
          title: "Your Choices",
          items: [
            "You can update available account and profile information.",
            "You can request removal of contributions where appropriate.",
            "You can contact OpenNotes regarding questions about your personal information.",
          ],
        },

        {
          title: "Policy Changes",
          content: (
            <p>
              This Privacy Policy may be updated from time to time. Changes will
              be reflected on this page together with an updated revision date.
            </p>
          ),
        },
      ]}
    />
  )
}
