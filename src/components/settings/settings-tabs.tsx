"use client"

import { useState } from "react"
import { AppearanceSettings } from "./appearance-settings"
import { SecuritySettings } from "./security-settings"
import {
  PaintBoardIcon,
  SecurityCheckIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { PublicSessionType } from "@/types/session"
import { ProfileSettings } from "./profile-settings"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { UserType } from "@/types/auth"

const TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: UserIcon,
  },
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

export function SettingsTabs({
  sessions,
  user,
}: {
  sessions: PublicSessionType[]
  user: UserType | null
}) {
  const [activeTab, setActiveTab] = useState<TabId>("profile")

  return (
    <div>
      <nav
        aria-label="Settings sections"
        className="mx-1 mb-8 flex gap-1 border-b border-border"
        role="tablist"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative -mb-px flex items-center gap-2 border-b-2 px-2 py-2.5 text-sm font-medium whitespace-nowrap",
                "border-transparent text-muted-foreground",
                isActive && "text-primary"
              )}
            >
              <HugeiconsIcon icon={tab.icon} size={15} strokeWidth={2} />
              <span className="relative">{tab.label}</span>
              {isActive && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute right-0 bottom-[-1.8px] left-0 h-0.5 bg-primary"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        key={activeTab}
      >
        {activeTab === "profile" && user && <ProfileSettings user={user} />}
        {activeTab === "appearance" && <AppearanceSettings />}
        {activeTab === "security" && <SecuritySettings sessions={sessions} />}
      </div>
    </div>
  )
}
