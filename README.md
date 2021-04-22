# Screenshot API

This is a standalone API for screenshotting a webpage. Send a request with the
URL you want to capture and you'll receive a buffer of a PNG image in response.

## Installing

```shell
yarn
```

## Developing

If you have `vercel CLI` installed globally:

```shell
vercel dev
```

## Deploying

Vercel Github integration recommended.

- Assign the deployment to a domain e.g. `screenshot.example.com`
- Set region in [./vercel.json](./vercel.json), thinking about where your
  requesters are and where the domain you want to snapshot is hosted.

## Using

Send a `POST` request to `https://screenshot.example.com/api` with a JSON body
containing the properties defined in [./types.ts](./types.ts)

Note: If passing `cookies`, at least one of `url` and `domain` needs to be
specified on each cookie object.

Example request:

```javascript
const API_URL = "https://screenshot.example.com/api"
const SNAPSHOT_URL = "https://example.com/my-pretty-report"
const IMAGE_FILENAME = "my-pretty-report.png"

function arrayBufferToBase64(buffer: Buffer) {
  var binary = ""
  var bytes = [].slice.call(new Uint8Array(buffer))
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return window.btoa(binary)
}

fetch(API_URL, {
  method: "POST",
  body: JSON.stringify({
    url: SNAPSHOT_URL,
    width: 1280,
    height: 800,
  }),
})
  .then((res) => {
    if (!res.ok) {
      return res.text().then((message) => {
        throw new Error(message)
      })
    }
    return res.arrayBuffer()
  })
  .then((buffer) => {
    const base64 = arrayBufferToBase64(buffer)
    const src = `data:${IMAGE_TYPE};base64,${base64}`
    const file = new File([buffer], IMAGE_FILENAME, {
      type: "image/png",
    })
    // Do something with src & file e.g. set react state: setImage({ src, file })
  })
  .catch((err) => {
    console.error(err)
    // Do something with error
  })
```

<!-- ## Environment Variables

```bash
DOMAIN=""
``` -->

<!-- ## Local Dev

```bash
yarn add --dev puppeteer@5.5.0
``` -->
