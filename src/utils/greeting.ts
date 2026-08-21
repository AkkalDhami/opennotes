export function getGreeting(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] || "there"
  const hour = new Date().getHours()

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"

  return `${greeting}, ${firstName}`
}
