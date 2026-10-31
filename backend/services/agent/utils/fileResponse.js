// Helpers for the chat messages returned by the PDF, PPT and Vision agents

// Removes characters that would break the surrounding markdown
const clean = (text = "") => String(text).replace(/[[\]*_`#>|]/g, "").replace(/\s+/g, " ").trim()

// Turns a title into a safe ASCII file name (it is also sent in the Content-Disposition header)
export const toFileName = (title, extension, fallback) => {
    const base = String(title || "")
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60)
    return `${base || fallback}.${extension}`
}

// ["a", "b", "c", "d"] -> "a, b, c and 1 more topic"
const summariseTopics = (topics, limit = 3) => {
    const items = topics.map(clean).filter(Boolean)
    const shown = items.slice(0, limit)
    const remaining = items.length - shown.length
    if (shown.length === 0) return ""
    if (remaining > 0) return `${shown.join(", ")} and ${remaining} more ${remaining === 1 ? "topic" : "topics"}`
    if (shown.length === 1) return shown[0]
    return `${shown.slice(0, -1).join(", ")} and ${shown.at(-1)}`
}

export const pptResponse = (data, filename, url) => {
    const slides = data.slides || []
    const topics = summariseTopics(slides.map(slide => slide.title))
    const subtitle = clean(data.subtitle)
    return `### Your presentation is ready
**${clean(data.title)}**${subtitle ? ` · ${subtitle}` : ""}

This ${slides.length}-slide deck covers ${topics}. Every slide uses short, clear bullet points, so it's ready to present as is or to customise in PowerPoint or Google Slides.

[${filename}](${url})`
}

export const pdfResponse = (data, filename, url) => {
    const sections = data.sections || []
    const topics = summariseTopics(sections.map(section => section.heading))
    const subtitle = clean(data.subtitle)
    return `### Your PDF is ready
**${clean(data.title)}**${subtitle ? ` · ${subtitle}` : ""}

This ${sections.length}-section document covers ${topics}. It's laid out with headings and concise bullet points, ready to read, print or share.

[${filename}](${url})`
}

export const imageResponse = (userPrompt, filename, url) => {
    const prompt = clean(userPrompt)
    const shortPrompt = prompt.length > 120 ? `${prompt.slice(0, 117)}...` : prompt
    return `### Your image is ready

![${shortPrompt}](${url})

Created from your prompt "${shortPrompt}", enhanced with cinematic lighting, sharp detail and a balanced colour palette. Click the image to view it full size.

[${filename}](${url})`
}
