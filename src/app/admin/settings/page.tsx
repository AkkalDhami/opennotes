import { SettingsNav } from "@/components/settings/settings-nav"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"

export const metadata = {
  title: "Settings — OpenNotes",
}

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Heading>Settings</Heading>
        <SubHeading>
          Manage your personal preferences and interface experience.
        </SubHeading>
      </div>

      <SettingsNav />

      <AppearanceSettings />
    </div>
  )
}
