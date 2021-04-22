export interface BodyProps {
  url: string
  width: number
  height: number
  cookies?: Array<{
    name: string
    value: string
    url?: string
    domain?: string
    path?: string
    expires?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: "Strict" | "Lax"
  }>
}
