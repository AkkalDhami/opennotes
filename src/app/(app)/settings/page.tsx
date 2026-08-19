import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { Container } from "@/components/ui/container"

export const metadata = {
  title: "Settings",
  description: "Manage your personal preferences and interface experience.",
}

export default function SettingsPage() {
  return (
    <Container className="space-y-6 border-x px-4 pt-4 pb-6">
      <div className="mb-6 space-y-2">
        <Heading>Settings</Heading>
        <SubHeading>
          Manage your personal preferences and interface experience.
        </SubHeading>
      </div>

      <AppearanceSettings />
    </Container>
  )
}
