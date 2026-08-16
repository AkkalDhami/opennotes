import {
  Calculator01Icon,
  Atom02Icon,
  TestTube01Icon,
  SourceCodeIcon,
  MicroscopeIcon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons"
import { IconSvgObject } from "@hugeicons/core-free-icons/types"

export interface Subject {
  id: string
  name: string
  slug: string
  noteCount: number
  icon: IconSvgObject
}

export const popularSubjects: Subject[] = [
  {
    id: "1",
    name: "Mathematics",
    slug: "mathematics",
    noteCount: 128,
    icon: Calculator01Icon,
  },
  {
    id: "2",
    name: "Physics",
    slug: "physics",
    noteCount: 96,
    icon: Atom02Icon,
  },
  {
    id: "3",
    name: "Chemistry",
    slug: "chemistry",
    noteCount: 84,
    icon: TestTube01Icon,
  },
  {
    id: "4",
    name: "Computer Science",
    slug: "computer-science",
    noteCount: 72,
    icon: SourceCodeIcon,
  },
  {
    id: "5",
    name: "Biology",
    slug: "biology",
    noteCount: 65,
    icon: MicroscopeIcon,
  },
  {
    id: "6",
    name: "Economics",
    slug: "economics",
    noteCount: 48,
    icon: ChartLineData01Icon,
  },
]
