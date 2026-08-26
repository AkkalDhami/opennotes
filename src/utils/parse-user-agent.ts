export type ParsedUserAgent = {
  os: string
  browser: string
  device: string
  deviceDetail: string
  deviceType: "desktop" | "mobile" | "tablet" | "unknown"
}

function detectOS(ua: string): {
  label: string
  full: string
  type: ParsedUserAgent["deviceType"]
} {
  if (/iPhone/i.test(ua))
    return {
      label: "iPhone",
      full: iosVersion(ua) ?? "iOS",
      type: "mobile",
    }
  if (/iPad/i.test(ua))
    return {
      label: "iPad",
      full: iosVersion(ua) ?? "iPadOS",
      type: "tablet",
    }
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([\d.]+)/i)
    return {
      label: "Android",
      full: match ? `Android ${match[1]}` : "Android",
      type: "mobile",
    }
  }
  if (/Windows NT 10\.0/i.test(ua))
    return {
      label: "Windows",
      full: "Windows 10/11",
      type: "desktop",
    }
  if (/Windows/i.test(ua))
    return {
      label: "Windows",
      full: "Windows",
      type: "desktop",
    }
  if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([\d_]+)/i)
    const version = match ? match[1].replace(/_/g, ".") : undefined
    return {
      label: "macOS",
      full: version ? `macOS ${version}` : "macOS",
      type: "desktop",
    }
  }
  if (/Linux/i.test(ua))
    return {
      label: "Linux",
      full: "Linux",
      type: "desktop",
    }
  return {
    label: "Unknown device",
    full: "Unknown device",
    type: "unknown",
  }
}

function iosVersion(ua: string): string | null {
  const match = ua.match(/OS ([\d_]+) like Mac OS X/i)
  return match ? `iOS ${match[1].replace(/_/g, ".")}` : null
}

function detectBrowser(ua: string): { label: string; full: string } {
  // Order matters: Edge/OPR contain "Chrome" and "Safari" tokens too.
  let match = ua.match(/Edg\/([\d.]+)/i)
  if (match)
    return {
      label: "Edge",
      full: `Edge ${match[1]}`,
    }

  match = ua.match(/OPR\/([\d.]+)/i)
  if (match)
    return {
      label: "Opera",
      full: `Opera ${match[1]}`,
    }

  match = ua.match(/Firefox\/([\d.]+)/i)
  if (match)
    return {
      label: "Firefox",
      full: `Firefox ${match[1]}`,
    }

  match = ua.match(/Chrome\/([\d.]+)/i)
  if (match)
    return {
      label: "Chrome",
      full: `Chrome ${match[1]}`,
    }

  match = ua.match(/Version\/([\d.]+).*Safari/i)
  if (match)
    return {
      label: "Safari",
      full: `Safari ${match[1]}`,
    }

  if (/Safari/i.test(ua))
    return {
      label: "Safari",
      full: "Safari",
    }

  return {
    label: "Unknown browser",
    full: "Unknown browser",
  }
}

export function parseUserAgent(
  userAgent: string | null | undefined
): ParsedUserAgent {
  const ua = userAgent ?? ""
  const os = detectOS(ua)
  const browser = detectBrowser(ua)

  return {
    os: os.label,
    browser: browser.label,
    device: `${os.label} · ${browser.label}`,
    deviceDetail: `${os.full} · ${browser.full}`,
    deviceType: os.type,
  }
}
