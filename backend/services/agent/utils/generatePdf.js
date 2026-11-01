import PDFDocument from "pdfkit"
import { fileURLToPath } from "url"
import { NEUTRAL, formatDate, pad2, pickPalette } from "./docTheme.js"

const fontPath = (file) => fileURLToPath(new URL(`../assets/fonts/${file}`, import.meta.url))

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN_X = 56
const CONTENT_W = PAGE_W - MARGIN_X * 2
const TOP = 82
const BOTTOM = PAGE_H - 72

const hex = (color) => `#${color}`

// Characters the AI often uses that the embedded font has no glyph for
const REPLACEMENTS = { "‐": "-", "‑": "-", "‒": "–", "→": "->", "←": "<-", "⇒": "=>", "✓": "", "✔": "", " ": " " }

const makeCleaner = (doc) => (text = "") => {
    const glyphFont = doc._font?.font
    return Array.from(String(text).replace(/\p{Extended_Pictographic}|️/gu, ""))
        .map((ch) => {
            if (REPLACEMENTS[ch] !== undefined) return REPLACEMENTS[ch]
            const code = ch.codePointAt(0)
            if (code < 128 || !glyphFont?.hasGlyphForCodePoint || glyphFont.hasGlyphForCodePoint(code)) return ch
            return ch.normalize("NFKD").replace(/[^\x20-\x7E]/g, "")
        })
        .join("")
        .replace(/[ \t]+/g, " ")
        .trim()
}

export const generatePdf = async (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margins: { top: TOP, bottom: PAGE_H - BOTTOM, left: MARGIN_X, right: MARGIN_X },
            bufferPages: true,
            info: { Author: "CortexAI", Title: data.title, Creator: "CortexAI" },
        })

        const chunks = []
        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))
        doc.on("error", reject)

        try {
            doc.registerFont("Regular", fontPath("Poppins-Regular.ttf"))
            doc.registerFont("Medium", fontPath("Poppins-Medium.ttf"))
            doc.registerFont("SemiBold", fontPath("Poppins-SemiBold.ttf"))
            doc.registerFont("Bold", fontPath("Poppins-Bold.ttf"))
            doc.font("Regular")
            const clean = makeCleaner(doc)

            const pal = pickPalette(data.title)
            const title = clean(data.title)
            const subtitle = clean(data.subtitle)
            const summary = clean(data.summary)
            const conclusion = clean(data.conclusion)
            const sections = (data.sections || [])
                .map((section) => ({
                    heading: clean(section?.heading),
                    intro: clean(section?.intro),
                    highlight: clean(section?.highlight),
                    points: (Array.isArray(section?.points) ? section.points : []).map(clean).filter(Boolean),
                }))
                .filter((section) => section.heading)

            // Starts a new page when the next block would not fit
            const ensureSpace = (height) => {
                if (doc.y + height > BOTTOM) {
                    doc.addPage()
                    doc.y = TOP
                }
            }

            const label = (text, color, y = doc.y) => {
                doc.font("SemiBold").fontSize(8.5).fillColor(hex(color))
                    .text(text, MARGIN_X, y, { characterSpacing: 1.6, width: CONTENT_W })
            }

            // ---------- Cover ----------
            doc.rect(0, 0, PAGE_W, PAGE_H).fill(hex(pal.dark))
            doc.fillOpacity(0.55).circle(PAGE_W - 40, 120, 210).fill(hex(pal.primary))
            doc.fillOpacity(0.5).circle(PAGE_W - 150, 330, 120).fill(hex(pal.secondary))
            doc.fillOpacity(0.85).circle(PAGE_W - 300, 200, 26).fill(hex(pal.accent))
            doc.fillOpacity(1)
            doc.lineWidth(1).strokeOpacity(0.25).circle(PAGE_W - 120, 170, 150).stroke("#FFFFFF").strokeOpacity(1)

            doc.font("SemiBold").fontSize(9).fillColor(hex(pal.accent))
                .text(`REPORT   ·   ${formatDate().toUpperCase()}`, MARGIN_X, 470, { characterSpacing: 2 })
            doc.rect(MARGIN_X, doc.y + 10, 64, 4).fill(doc.linearGradient(MARGIN_X, 0, MARGIN_X + 64, 0).stop(0, hex(pal.accent)).stop(1, hex(pal.secondary)))
            doc.font("Bold").fontSize(title.length > 50 ? 28 : 34).fillColor("#FFFFFF")
                .text(title, MARGIN_X, doc.y + 28, { width: 420, lineGap: -2 })
            if (subtitle) {
                doc.font("Regular").fontSize(13).fillColor("#CBD5E1").text(subtitle, MARGIN_X, doc.y + 12, { width: 400, lineGap: 2 })
            }
            // These sit inside the bottom margin, so lift the margin or pdfkit starts a new page
            doc.page.margins.bottom = 0
            doc.font("Medium").fontSize(10).fillColor("#FFFFFF").text("Prepared with CortexAI", MARGIN_X, PAGE_H - 92, { lineBreak: false })
            doc.font("Regular").fontSize(9).fillColor("#94A3B8").text(`${sections.length} sections`, MARGIN_X, PAGE_H - 76, { lineBreak: false })
            doc.page.margins.bottom = PAGE_H - BOTTOM

            // ---------- Summary and contents ----------
            doc.addPage()
            doc.y = TOP

            if (summary) {
                label("EXECUTIVE SUMMARY", pal.primary)
                const textH = doc.font("Regular").fontSize(11.5).heightOfString(summary, { width: CONTENT_W - 44, lineGap: 3 })
                const boxY = doc.y + 8
                doc.roundedRect(MARGIN_X, boxY, CONTENT_W, textH + 36, 10).fill(hex(pal.tint))
                doc.rect(MARGIN_X, boxY + 14, 4, textH + 8).fill(hex(pal.primary))
                doc.font("Regular").fontSize(11.5).fillColor(hex(NEUTRAL.ink)).text(summary, MARGIN_X + 24, boxY + 18, { width: CONTENT_W - 44, lineGap: 3 })
                doc.y = boxY + textH + 60
            }

            label("IN THIS DOCUMENT", pal.primary)
            doc.y += 10
            sections.forEach((section, i) => {
                ensureSpace(34)
                const y = doc.y
                doc.roundedRect(MARGIN_X, y, 30, 22, 6).fill(hex(i % 2 ? pal.secondary : pal.primary))
                doc.font("SemiBold").fontSize(9.5).fillColor("#FFFFFF").text(pad2(i + 1), MARGIN_X, y + 5.5, { width: 30, align: "center" })
                doc.font("Medium").fontSize(11.5).fillColor(hex(NEUTRAL.ink)).text(section.heading, MARGIN_X + 44, y + 3, { width: CONTENT_W - 44, lineBreak: false, ellipsis: true })
                doc.moveTo(MARGIN_X + 44, y + 30).lineTo(MARGIN_X + CONTENT_W, y + 30).lineWidth(0.6).stroke(hex(NEUTRAL.border))
                doc.y = y + 38
            })

            // ---------- Sections ----------
            doc.y += 24
            sections.forEach((section, i) => {
                const headingH = doc.font("Bold").fontSize(17).heightOfString(section.heading, { width: CONTENT_W - 46 })
                ensureSpace(headingH + 90)
                const y = doc.y
                doc.roundedRect(MARGIN_X, y + 1, 34, 24, 7).fill(hex(pal.primary))
                doc.font("SemiBold").fontSize(10.5).fillColor("#FFFFFF").text(pad2(i + 1), MARGIN_X, y + 7, { width: 34, align: "center" })
                doc.font("Bold").fontSize(17).fillColor(hex(NEUTRAL.ink)).text(section.heading, MARGIN_X + 46, y, { width: CONTENT_W - 46, lineGap: -1 })
                doc.y = Math.max(doc.y, y + 28) + 6
                doc.rect(MARGIN_X, doc.y, 40, 2.5).fill(hex(pal.accent))
                doc.y += 12

                if (section.intro) {
                    doc.font("Regular").fontSize(11).fillColor(hex(NEUTRAL.muted)).text(section.intro, MARGIN_X, doc.y, { width: CONTENT_W, lineGap: 3 })
                    doc.y += 8
                }

                section.points.forEach((point) => {
                    const pointH = doc.font("Regular").fontSize(11).heightOfString(point, { width: CONTENT_W - 20, lineGap: 3 })
                    ensureSpace(pointH + 6)
                    const py = doc.y
                    doc.circle(MARGIN_X + 5, py + 7.5, 2.8).fill(hex(pal.primary))
                    doc.font("Regular").fontSize(11).fillColor(hex(NEUTRAL.body)).text(point, MARGIN_X + 20, py, { width: CONTENT_W - 20, lineGap: 3 })
                    doc.y += 5
                })

                if (section.highlight) {
                    const textH = doc.font("Medium").fontSize(11).heightOfString(section.highlight, { width: CONTENT_W - 44, lineGap: 2 })
                    const boxH = textH + 44
                    ensureSpace(boxH + 10)
                    const boxY = doc.y + 6
                    doc.roundedRect(MARGIN_X, boxY, CONTENT_W, boxH, 10).fill(hex(pal.tint))
                    doc.rect(MARGIN_X, boxY + 12, 4, boxH - 24).fill(hex(pal.primary))
                    doc.font("SemiBold").fontSize(8).fillColor(hex(pal.primary)).text("KEY INSIGHT", MARGIN_X + 22, boxY + 13, { characterSpacing: 1.6 })
                    doc.font("Medium").fontSize(11).fillColor(hex(NEUTRAL.ink)).text(section.highlight, MARGIN_X + 22, boxY + 27, { width: CONTENT_W - 44, lineGap: 2 })
                    doc.y = boxY + boxH
                }

                doc.y += 26
            })

            if (conclusion) {
                const textH = doc.font("Regular").fontSize(11.5).heightOfString(conclusion, { width: CONTENT_W - 48, lineGap: 3 })
                const boxH = textH + 60
                ensureSpace(boxH)
                const boxY = doc.y
                doc.roundedRect(MARGIN_X, boxY, CONTENT_W, boxH, 12).fill(hex(pal.dark))
                doc.save().roundedRect(MARGIN_X, boxY, CONTENT_W, boxH, 12).clip()
                doc.fillOpacity(0.55).circle(MARGIN_X + CONTENT_W - 10, boxY + 10, 70).fill(hex(pal.primary)).fillOpacity(1)
                doc.restore()
                doc.font("SemiBold").fontSize(8.5).fillColor(hex(pal.accent)).text("CONCLUSION", MARGIN_X + 24, boxY + 20, { characterSpacing: 1.6 })
                doc.font("Regular").fontSize(11.5).fillColor("#FFFFFF").text(conclusion, MARGIN_X + 24, boxY + 38, { width: CONTENT_W - 48, lineGap: 3 })
            }

            // ---------- Running header and footer (all pages except the cover) ----------
            const { start, count } = doc.bufferedPageRange()
            for (let i = start + 1; i < start + count; i++) {
                doc.switchToPage(i)
                const bottomMargin = doc.page.margins.bottom
                doc.page.margins.bottom = 0
                doc.font("Medium").fontSize(8.5).fillColor(hex(NEUTRAL.muted))
                    .text(title, MARGIN_X, 38, { width: CONTENT_W - 90, lineBreak: false, ellipsis: true })
                doc.font("SemiBold").fontSize(8.5).fillColor(hex(pal.primary)).text("CortexAI", MARGIN_X, 38, { width: CONTENT_W, align: "right", lineBreak: false })
                doc.moveTo(MARGIN_X, 56).lineTo(MARGIN_X + CONTENT_W, 56).lineWidth(0.6).stroke(hex(NEUTRAL.border))
                doc.rect(MARGIN_X, 55, 36, 2).fill(hex(pal.primary))

                doc.moveTo(MARGIN_X, PAGE_H - 52).lineTo(MARGIN_X + CONTENT_W, PAGE_H - 52).lineWidth(0.6).stroke(hex(NEUTRAL.border))
                doc.font("Regular").fontSize(8.5).fillColor(hex(NEUTRAL.faint)).text("Generated with CortexAI", MARGIN_X, PAGE_H - 42, { lineBreak: false })
                doc.font("Medium").fontSize(8.5).fillColor(hex(NEUTRAL.muted)).text(`Page ${i + 1 - start} of ${count}`, MARGIN_X, PAGE_H - 42, { width: CONTENT_W, align: "right", lineBreak: false })
                doc.page.margins.bottom = bottomMargin
            }

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}
