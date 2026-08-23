"use client"

import { useState } from "react"
import { AppearanceSettings } from "./appearance-settings"
import { SecuritySettings } from "./security-settings"
import { PaintBoardIcon, SecurityCheckIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { PublicSessionType } from "@/types/session"

const TABS = [
  {
    id: "appearance",
    label: "Appearance",
    icon: PaintBoardIcon,
  },
  {
    id: "security",
    label: "Security",
    icon: SecurityCheckIcon,
  },
] as const

type TabId = (typeof TABS)[number]["id"]

export function SettingsTabs({ sessions }: { sessions: PublicSessionType[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("appearance")

  return (
    <div>
      <nav
        aria-label="Settings sections"
        className="mx-1 mb-8 flex gap-1 border-b border-border px-1"
        role="tablist"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "-mb-px flex items-center gap-2 border-b-2 px-2 py-2.5 text-sm font-medium whitespace-nowrap",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground",
              ].join(" ")}
            >
              <HugeiconsIcon icon={tab.icon} size={15} strokeWidth={2} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        key={activeTab}
      >
        {activeTab === "appearance" && <AppearanceSettings />}
        {activeTab === "security" && <SecuritySettings sessions={sessions} />}
      </div>
    </div>
  )
}
