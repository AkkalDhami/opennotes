import type { Metadata, Route } from "next"
import { links, externalLinkProps } from "@/lib/feedback-links"
import { Container } from "@/components/ui/container"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = {
  title: "Help & Feedback",
  description:
    "Pick the channel that fits. GitHub channels are public, so never post personal information there. Use email for anything private.",
}

type Channel = {
  title: string
  when: string
  href: string
  label: string
  external: boolean
}

const publicChannels: Channel[] = [
  {
    title: "Report a note",
    when: "A note is wrong, misleading, spam, a duplicate or unreadable. Opens a public GitHub issue, so keep personal details out. Use the Report this note menu on the note itself to prefill the link.",
    href: links.reportNote({ url: "" }),
    label: "Open report form",
    external: true,
  },
  {
    title: "Report a bug",
    when: "Something on OpenNotes is broken or behaves unexpectedly.",
    href: links.reportBug(),
    label: "Report a bug",
    external: true,
  },
  {
    title: "Suggest a feature",
    when: "You have an idea that would make OpenNotes better.",
    href: links.suggestFeature(),
    label: "Share an idea",
    external: true,
  },
  {
    title: "Request notes",
    when: "You need notes on a subject or course that isn't covered yet.",
    href: links.requestNotes(),
    label: "Request notes",
    external: true,
  },
  {
    title: "Ask a question",
    when: "You need help using OpenNotes.",
    href: links.askQuestion(),
    label: "Ask in Q&A",
    external: true,
  },
  {
    title: "General feedback",
    when: "Anything else you want to tell us publicly.",
    href: links.feedback(),
    label: "Start a discussion",
    external: true,
  },
]

const privateChannels: Channel[] = [
  {
    title: "Copyright issues",
    when: "You own content that appears in a note. Email only, never GitHub. Include the note URL and details of your claim.",
    href: links.copyright({ url: "" }),
    label: "Email a copyright claim",
    external: false,
  },
  {
    title: "Contact us privately",
    when: "Harassment, private information, account matters or anything you don't want public.",
    href: links.contact(),
    label: "Email support",
    external: false,
  },
]

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <li className="flex flex-col rounded-lg border bg-card p-4">
      <h3 className="text-base font-medium">{channel.title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
        {channel.when}
      </p>
      <Link
        href={channel.href as Route}
        {...(channel.external ? externalLinkProps : {})}
        className={cn(
          "mt-4",
          buttonVariants({
            variant: "default",
          })
        )}
      >
        {channel.label}
        {channel.external && (
          <span className="sr-only"> (opens in a new tab)</span>
        )}
      </Link>
    </li>
  )
}

function Group({
  title,
  description,
  channels,
}: {
  title: string
  description: string
  channels: Channel[]
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {channels.map((c) => (
          <ChannelCard key={c.title} channel={c} />
        ))}
      </ul>
    </section>
  )
}

export default function SupportPage() {
  return (
    <Container className="space-y-6 px-4 pt-4 pb-6">
      <PageHeader
        title="Support"
        highlight="Support"
        description="Pick the channel that fits. GitHub channels are public, so never post personal information there. Use email for anything private."
      ></PageHeader>

      <Group
        title="Public, on GitHub"
        description="Anyone can read these. Don't include personal information."
        channels={publicChannels}
      />
      <Group
        title="Private, by email"
        description="Opens your email app and goes only to our support team."
        channels={privateChannels}
      />
    </Container>
  )
}
