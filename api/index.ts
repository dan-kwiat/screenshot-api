import { NowRequest, NowResponse } from "@vercel/node"
import chromium from "chrome-aws-lambda"
import Cors from "cors"
import { BodyProps } from "../types"

const cors = Cors({})

const WIDTH_LIMITS = [100, 2000]
const HEIGHT_LIMITS = [100, 2000]

async function getScreenshot({
  url,
  width,
  height,
  cookies,
}: BodyProps): Promise<string | void | Buffer> {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width, height },
    executablePath: await chromium.executablePath,
    headless: true, //chromium.headless
    ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage()
  if (cookies) {
    await page.setCookie(...cookies)
  }
  await page.goto(url)
  const buffer = await page.screenshot({
    type: "png",
    encoding: "binary",
  })
  // I wonder if instead of launching & closing each time we could launch browser outside the handler & reuse it for multiple requests.
  await browser.close()
  return buffer
}

function validateSize({
  width,
  height,
}: {
  width: number
  height: number
}): void {
  if (!width) {
    throw new Error("Request body must have 'width' property")
  }
  if (width < WIDTH_LIMITS[0] || width > WIDTH_LIMITS[1]) {
    throw new Error(`Width must be in range [${WIDTH_LIMITS.join(",")}]`)
  }
  if (!height) {
    throw new Error("Request body must have 'height' property")
  }
  if (height < HEIGHT_LIMITS[0] || height > HEIGHT_LIMITS[1]) {
    throw new Error(`Height must be in range [${HEIGHT_LIMITS.join(",")}]`)
  }
}

function validateUrl(url: string): void {
  if (!url) {
    throw new Error("Request body must have 'url' property")
  }
  // todo: validate domain
}

export default async function handler(req: NowRequest, res: NowResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).end("Only POST method is allowed")
    return
  }
  await new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })

  // todo: add authentication

  try {
    const { url, width, height, cookies }: BodyProps = JSON.parse(req.body)

    validateUrl(url)
    validateSize({ width, height })

    const buffer = await getScreenshot({ url, width, height, cookies })
    res.send(buffer)
  } catch (e) {
    console.error(e)
    res.status(400).end(e.message || "Something went wrong")
  }
}
