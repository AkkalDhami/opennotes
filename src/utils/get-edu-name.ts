import {
  COURSE_LEVELS,
  EDUCATIONAL_LEVELS,
  GRADES,
  NOTES_CATEGORIES,
} from "@/constants/notes.constants"

import { SUBJECTS } from "@/constants/notes.constants"

type NamedItem = {
  id: string
  name: string
}

export function getName<T extends NamedItem>(
  items: readonly T[],
  id?: string | null
): string | undefined {
  return items.find((item) => item.id === id)?.name
}

export function getSubjectName(subject?: string | null) {
  return getName(SUBJECTS, subject)
}

export function getEducationLevelName(educationLevel?: string | null) {
  return getName(EDUCATIONAL_LEVELS, educationLevel)
}

export function getCourseName(course?: string | null) {
  return getName(COURSE_LEVELS, course)
}

export function getGradeName(grade?: string | null) {
  return getName(GRADES, grade)
}

export function getCategoryName(category?: string | null) {
  return getName(NOTES_CATEGORIES, category)
}

export function getEducationNames({
  subject,
  category,
  educationLevel,
  course,
  grade,
}: {
  subject?: string | null
  category?: string | null
  educationLevel?: string | null
  course?: string | null
  grade?: string | null
}) {
  return {
    subject: getSubjectName(subject),
    category: getCategoryName(category),
    educationLevel: getEducationLevelName(educationLevel),
    course: getCourseName(course),
    grade: getGradeName(grade),
  }
}
