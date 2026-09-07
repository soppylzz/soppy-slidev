import { isString } from "@soppy-slidev/shared"

type DownloadMIME =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/gif"
  // may support pdf/text download in the future
  | "text/plain"
  | "application/pdf"

interface DownloadOptions {
  name?: string
  type?: DownloadMIME
}

const MIME_EXTENSIONS: Record<DownloadMIME, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "text/plain": "txt",
  "application/pdf": "pdf",
}

const DEFAULT_EXTENSION = "bin"

const urlExtReg = /\.([a-zA-Z0-9]+)(?:[?#].*)?$/

function getExtension(src: string, type?: DownloadMIME) {
  if (type) return MIME_EXTENSIONS[type]
  const match = src.match(urlExtReg)
  return match?.[1]?.toLowerCase() || DEFAULT_EXTENSION
}

function getFilename(src: string | Blob | File, options?: DownloadOptions) {
  if (src instanceof File && src.name) {
    return src.name
  }

  const extension = isString(src)
    ? getExtension(src, options?.type)
    : options?.type
      ? MIME_EXTENSIONS[options.type]
      : DEFAULT_EXTENSION

  return `${options?.name || "download"}.${extension}`
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = filename
  anchor.style.display = "none"

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export async function baseDownload(
  src: string | Blob | File,
  options?: DownloadOptions
): Promise<void> {
  const filename = getFilename(src, options)

  try {
    if (src instanceof Blob) {
      const url = URL.createObjectURL(src)
      try {
        triggerDownload(url, filename)
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 0)
      }
      return
    }

    if (src.startsWith("data:")) {
      triggerDownload(src, filename)
      return
    }

    const response = await fetch(src)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    try {
      triggerDownload(url, filename)
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 0)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Download failed: ${message}`, {
      cause: error,
    })
  }
}
