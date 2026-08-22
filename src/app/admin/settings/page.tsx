import { SettingsNav } from "@/components/settings/settings-nav"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { Heading } from "@/components/ui/heading"
import { SubHeading } from "@/components/ui/sub-heading"
import { DashboardContainer } from "@/components/ui/dashboard-container"

export const metadata = {
  title: "Settings — OpenNotes",
}

export default function SettingsPage() {
  return (
    <DashboardContainer>
      <div className="space-y-2">
        <Heading>Settings</Heading>
        <SubHeading>
          Manage your personal preferences and interface experience.
        </SubHeading>
      </div>

      <SettingsNav />

      <AppearanceSettings />
    </DashboardContainer>
  )
}
