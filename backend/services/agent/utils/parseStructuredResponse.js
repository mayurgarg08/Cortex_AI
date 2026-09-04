const contentToText = (content) => {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content.map((part) => typeof part === "string" ? part : part?.text || "").join("")
  }
  return String(content || "")
}

export const parseStructuredResponse = (content, collectionName) => {
  const text = contentToText(content).trim()
  const withoutFence = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
  const start = withoutFence.indexOf("{")
  const end = withoutFence.lastIndexOf("}")

  if (start < 0 || end < start) {
    throw new Error("The model did not return a JSON object.")
  }

  const data = JSON.parse(withoutFence.slice(start, end + 1))
  if (!data || typeof data.title !== "string" || !Array.isArray(data[collectionName])) {
    throw new Error(`The model returned an invalid ${collectionName} document.`)
  }

  return data
}
