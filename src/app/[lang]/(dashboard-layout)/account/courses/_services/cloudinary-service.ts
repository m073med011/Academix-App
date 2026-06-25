// Cloudinary upload service with progress tracking
// Uses direct upload to Cloudinary without SDK

export type ResourceType = "image" | "video" | "raw" | "auto"

export interface CloudinaryUploadResult {
  url: string
  secureUrl: string
  publicId: string
  resourceType: string
  format: string
  bytes: number
  width?: number
  height?: number
  duration?: number
}

export interface UploadProgressEvent {
  loaded: number
  total: number
  percentage: number
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload a file to Cloudinary with progress tracking
 * @param file - The file to upload
 * @param resourceType - The type of resource (image, video, raw, auto)
 * @param onProgress - Callback for upload progress updates
 * @returns Promise with the upload result containing the URL
 */
export function uploadToCloudinary(
  file: File,
  resourceType: ResourceType = "auto",
  onProgress?: (event: UploadProgressEvent) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      reject(
        new Error(
          "Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables."
        )
      )
      return
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100)
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage,
        })
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve({
            url: response.url,
            secureUrl: response.secure_url,
            publicId: response.public_id,
            resourceType: response.resource_type,
            format: response.format,
            bytes: response.bytes,
            width: response.width,
            height: response.height,
            duration: response.duration,
          })
        } catch {
          reject(new Error("Failed to parse Cloudinary response"))
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText)
          reject(
            new Error(
              errorResponse.error?.message ||
                `Upload failed with status ${xhr.status}`
            )
          )
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"))
    })

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was cancelled"))
    })

    xhr.open("POST", url)
    xhr.send(formData)
  })
}

/**
 * Get the resource type based on file MIME type
 */
export function getResourceTypeFromFile(file: File): ResourceType {
  const mimeType = file.type.toLowerCase()

  if (mimeType.startsWith("image/")) {
    return "image"
  }

  if (mimeType.startsWith("video/")) {
    return "video"
  }

  // Everything else (documents, audio, etc.) is "raw"
  return "raw"
}

/**
 * Extract public ID from Cloudinary URL
 * Supports standard URLs:
 * - https://res.cloudinary.com/cloud_name/image/upload/v12345/public_id.jpg
 * - https://res.cloudinary.com/cloud_name/image/upload/public_id.jpg
 * - https://res.cloudinary.com/cloud_name/image/upload/folder/public_id.jpg
 */
export function extractPublicId(url: string): string | null {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/
    const match = url.match(regex)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Delete a file from Cloudinary
 * Note: This requires a backend API endpoint since deletion requires a signed request
 * @param publicId - The public ID of the file to delete
 * @param resourceType - The type of resource (image, video, raw)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: ResourceType = "image"
): Promise<void> {
  const response = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicId,
      resourceType,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to delete file from Cloudinary")
  }
}

export const cloudinaryService = {
  uploadToCloudinary,
  getResourceTypeFromFile,
  deleteFromCloudinary,
}
