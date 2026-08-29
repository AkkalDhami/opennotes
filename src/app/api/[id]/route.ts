import { NextResponse } from "next/server"
import { RouteHandler } from "@/utils/route-handler"
import { STATUS_CODES } from "@/constants/status-codes"

export const GET = RouteHandler<{ id: string }>(async (_req, { params }) => {
  const { id } = await params

  return NextResponse.json(
    {
      success: true,
      data: {
        id,
      },
    },
    {
      status: STATUS_CODES.OK,
    }
  )
})
