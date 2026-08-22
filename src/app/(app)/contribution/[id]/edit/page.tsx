import { redirect } from "next/navigation"

export default async function page(
  props: PageProps<"/contribution/[id]/edit">
) {
  const { id } = await props.params

  redirect(`/profile/contributions/${id}`)
}
