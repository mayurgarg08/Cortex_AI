import pptxgen from "pptxgenjs"
import { NEUTRAL, formatDate, pad2, pickPalette } from "./docTheme.js"

// 16:9 wide layout, in inches
const W = 13.333
const H = 7.5
const FONT = "Segoe UI"
const NO_LINE = { type: "none" }

const LAYOUTS = ["cards", "split", "process", "stat"]
// Used when the model doesn't pick a layout, so consecutive slides still look different
const FALLBACK_ROTATION = ["cards", "split", "cards", "process", "split", "cards"]

const sizeByLength = (text, steps) => {
    const length = String(text || "").length
    for (const [limit, size] of steps) if (length <= limit) return size
    return steps[steps.length - 1][1]
}

const orb = (ppt, slide, x, y, d, color, transparency) => {
    slide.addShape(ppt.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color, transparency }, line: NO_LINE })
}

const badge = (ppt, slide, x, y, d, label, fill, color, fontSize = 12) => {
    slide.addShape(ppt.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: NO_LINE })
    slide.addText(label, { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: FONT, fontSize, bold: true, color, margin: 0 })
}

const addFooter = (ppt, slide, deck, page, { dark = false, x = 0.8 } = {}) => {
    const color = dark ? "94A3B8" : NEUTRAL.muted
    slide.addShape(ppt.ShapeType.rect, { x, y: 6.88, w: W - x - 0.8, h: 0.012, fill: { color: dark ? "334155" : NEUTRAL.border }, line: NO_LINE })
    slide.addText(deck.title, { x, y: 6.95, w: 8, h: 0.3, fontFace: FONT, fontSize: 9, color, margin: 0 })
    slide.addText(`${pad2(page)} / ${pad2(deck.total)}`, { x: W - 2.8, y: 6.95, w: 2, h: 0.3, align: "right", fontFace: FONT, fontSize: 9, bold: true, color, margin: 0 })
}

// White slide with kicker, title, accent underline and a soft corner decoration
const addHeader = (ppt, slide, pal, kicker, title) => {
    slide.background = { color: NEUTRAL.white }
    orb(ppt, slide, W - 2.4, -1.6, 3.6, pal.primary, 92)
    orb(ppt, slide, W - 1.1, -0.7, 1.7, pal.secondary, 88)
    slide.addText(kicker, { x: 0.8, y: 0.5, w: 8, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: pal.primary, charSpacing: 3, margin: 0 })
    slide.addText(title, {
        x: 0.8, y: 0.82, w: 10.4, h: 0.85, fontFace: FONT, bold: true, color: NEUTRAL.ink, valign: "top", margin: 0,
        fontSize: sizeByLength(title, [[40, 30], [60, 26], [999, 22]]), fit: "shrink",
    })
    slide.addShape(ppt.ShapeType.rect, { x: 0.8, y: 1.75, w: 0.75, h: 0.06, fill: { color: pal.primary }, line: NO_LINE })
}

const addHighlight = (ppt, slide, pal, text, y) => {
    slide.addShape(ppt.ShapeType.roundRect, { x: 0.8, y, w: W - 1.6, h: 0.72, rectRadius: 0.12, fill: { color: pal.dark }, line: NO_LINE })
    slide.addShape(ppt.ShapeType.rect, { x: 0.8, y: y + 0.16, w: 0.07, h: 0.4, fill: { color: pal.accent }, line: NO_LINE })
    slide.addText([
        { text: "KEY INSIGHT    ", options: { color: pal.accent, bold: true, fontSize: 10, charSpacing: 2 } },
        { text, options: { color: NEUTRAL.white, fontSize: 14 } },
    ], { x: 1.1, y, w: W - 2.2, h: 0.72, valign: "middle", fontFace: FONT, margin: 0, fit: "shrink" })
}

// Bullet rows with check badges, used by the split and stat layouts
const addChecklist = (ppt, slide, pal, points, x, y, w, h) => {
    const rowH = Math.min(1.05, h / Math.max(points.length, 1))
    const fontSize = rowH < 0.8 ? 14 : 16
    // Centre short lists vertically in the available space
    const offset = (h - rowH * points.length) / 2
    points.forEach((point, i) => {
        const rowY = y + offset + i * rowH
        badge(ppt, slide, x, rowY + 0.04, 0.4, "✓", pal.tint, pal.primary, 12)
        slide.addText(point, { x: x + 0.6, y: rowY, w: w - 0.6, h: rowH - 0.12, fontFace: FONT, fontSize, color: NEUTRAL.body, valign: "top", margin: 0, fit: "shrink" })
        if (i < points.length - 1) {
            slide.addShape(ppt.ShapeType.rect, { x: x + 0.6, y: rowY + rowH - 0.08, w: w - 0.6, h: 0.01, fill: { color: NEUTRAL.border }, line: NO_LINE })
        }
    })
}

const addCover = (ppt, deck, pal) => {
    const slide = ppt.addSlide()
    slide.background = { color: pal.dark }
    orb(ppt, slide, 8.0, -1.8, 6.6, pal.primary, 55)
    orb(ppt, slide, 10.3, 2.7, 4.8, pal.secondary, 58)
    orb(ppt, slide, 7.5, 5.0, 1.5, pal.accent, 30)
    slide.addShape(ppt.ShapeType.ellipse, { x: 9.0, y: 0.8, w: 3.6, h: 3.6, fill: { color: NEUTRAL.white, transparency: 100 }, line: { color: NEUTRAL.white, transparency: 65, width: 1.25 } })

    slide.addText(`PRESENTATION   ·   ${formatDate().toUpperCase()}`, { x: 0.8, y: 1.45, w: 8, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: pal.accent, charSpacing: 3, margin: 0 })
    slide.addShape(ppt.ShapeType.rect, { x: 0.8, y: 1.95, w: 0.9, h: 0.07, fill: { color: pal.accent }, line: NO_LINE })
    slide.addText(deck.title, {
        x: 0.8, y: 2.25, w: 7.6, h: 2.2, fontFace: FONT, bold: true, color: NEUTRAL.white, valign: "top", margin: 0,
        fontSize: sizeByLength(deck.title, [[35, 44], [60, 36], [999, 30]]), fit: "shrink",
    })
    if (deck.subtitle) {
        slide.addText(deck.subtitle, { x: 0.8, y: 4.55, w: 7.2, h: 0.9, fontFace: FONT, fontSize: 18, color: "CBD5E1", valign: "top", margin: 0, fit: "shrink" })
    }
    slide.addText(`Generated with CortexAI   ·   ${deck.slides.length} topics`, { x: 0.8, y: 6.75, w: 8, h: 0.3, fontFace: FONT, fontSize: 11, color: "94A3B8", margin: 0 })
}

const addAgenda = (ppt, deck, pal, page) => {
    const slide = ppt.addSlide()
    addHeader(ppt, slide, pal, "OVERVIEW", "Agenda")
    const items = deck.slides.slice(0, 8)
    const perColumn = items.length > 4 ? Math.ceil(items.length / 2) : items.length
    items.forEach((item, i) => {
        const column = Math.floor(i / perColumn)
        const x = 0.8 + column * 6.1
        const y = 2.2 + (i % perColumn) * 1.05
        slide.addShape(ppt.ShapeType.roundRect, { x, y, w: 0.6, h: 0.6, rectRadius: 0.12, fill: { color: i % 2 ? pal.secondary : pal.primary }, line: NO_LINE })
        slide.addText(pad2(i + 1), { x, y, w: 0.6, h: 0.6, align: "center", valign: "middle", fontFace: FONT, fontSize: 14, bold: true, color: NEUTRAL.white, margin: 0 })
        slide.addText(item.title, { x: x + 0.85, y, w: 4.9, h: 0.6, valign: "middle", fontFace: FONT, fontSize: 17, bold: true, color: NEUTRAL.ink, margin: 0, fit: "shrink" })
        slide.addShape(ppt.ShapeType.rect, { x: x + 0.85, y: y + 0.78, w: 4.9, h: 0.01, fill: { color: NEUTRAL.border }, line: NO_LINE })
    })
    addFooter(ppt, slide, deck, page)
}

const addCardsSlide = (ppt, deck, pal, item, index, page) => {
    const slide = ppt.addSlide()
    addHeader(ppt, slide, pal, `${pad2(index)}   ·   ${deck.title.toUpperCase()}`.slice(0, 70), item.title)

    const points = item.points.slice(0, 6)
    const n = points.length
    const cols = n <= 2 ? n : n === 4 ? 2 : 3
    const rows = Math.ceil(n / cols)
    const top = 2.15
    const bottom = item.highlight ? 5.7 : 6.55
    const gap = 0.3
    const cardW = (W - 1.6 - gap * (cols - 1)) / cols
    const cardH = (bottom - top - gap * (rows - 1)) / rows

    // Centre an incomplete last row
    const lastRowStart = (rows - 1) * cols
    const lastRowShift = ((cols - (n - lastRowStart)) * (cardW + gap)) / 2

    points.forEach((point, i) => {
        const x = 0.8 + (i % cols) * (cardW + gap) + (i >= lastRowStart ? lastRowShift : 0)
        const y = top + Math.floor(i / cols) * (cardH + gap)
        slide.addShape(ppt.ShapeType.roundRect, {
            x, y, w: cardW, h: cardH, rectRadius: 0.14, fill: { color: NEUTRAL.surface }, line: { color: NEUTRAL.border, width: 0.75 },
            shadow: { type: "outer", color: "0F172A", opacity: 0.08, blur: 6, offset: 2, angle: 90 },
        })
        slide.addShape(ppt.ShapeType.rect, { x: x + 0.3, y, w: 0.9, h: 0.06, fill: { color: i % 2 ? pal.secondary : pal.primary }, line: NO_LINE })
        badge(ppt, slide, x + 0.3, y + 0.3, 0.5, pad2(i + 1), pal.tint, pal.primary, 12)
        slide.addText(point, {
            x: x + 0.95, y: y + 0.27, w: cardW - 1.25, h: cardH - 0.5, fontFace: FONT, color: NEUTRAL.body, valign: "top", margin: 0,
            fontSize: cardH < 1.4 ? 13 : sizeByLength(point, [[60, 16], [110, 14], [999, 13]]), fit: "shrink",
        })
    })

    if (item.highlight) addHighlight(ppt, slide, pal, item.highlight, 5.95)
    addFooter(ppt, slide, deck, page)
}

const addSplitSlide = (ppt, deck, pal, item, index, page) => {
    const slide = ppt.addSlide()
    slide.background = { color: NEUTRAL.white }
    slide.addShape(ppt.ShapeType.rect, { x: 0, y: 0, w: 4.7, h: H, fill: { color: pal.dark }, line: NO_LINE })
    orb(ppt, slide, -1.4, 4.7, 3.8, pal.primary, 62)
    orb(ppt, slide, 2.9, 5.9, 1.4, pal.secondary, 50)

    slide.addText(pad2(index), { x: 0.7, y: 0.6, w: 3.2, h: 1.2, fontFace: FONT, fontSize: 66, bold: true, color: pal.accent, margin: 0 })
    slide.addText(item.title, {
        x: 0.7, y: 1.95, w: 3.4, h: 1.8, fontFace: FONT, bold: true, color: NEUTRAL.white, valign: "top", margin: 0,
        fontSize: sizeByLength(item.title, [[30, 28], [55, 24], [999, 20]]), fit: "shrink",
    })
    if (item.highlight) {
        slide.addShape(ppt.ShapeType.rect, { x: 0.7, y: 3.95, w: 0.6, h: 0.05, fill: { color: pal.accent }, line: NO_LINE })
        slide.addText(item.highlight, { x: 0.7, y: 4.15, w: 3.4, h: 1.9, fontFace: FONT, fontSize: 13, italic: true, color: "CBD5E1", valign: "top", margin: 0, fit: "shrink" })
    }

    addChecklist(ppt, slide, pal, item.points.slice(0, 6), 5.4, 0.85, 7.1, 5.75)
    addFooter(ppt, slide, deck, page, { x: 5.4 })
}

const addProcessSlide = (ppt, deck, pal, item, index, page) => {
    const slide = ppt.addSlide()
    addHeader(ppt, slide, pal, `${pad2(index)}   ·   STEP BY STEP`, item.title)

    const steps = item.points.slice(0, 5)
    const colW = (W - 1.6) / steps.length
    const lineY = 2.95
    slide.addShape(ppt.ShapeType.rect, { x: 0.8 + colW / 2, y: lineY - 0.02, w: colW * (steps.length - 1), h: 0.04, fill: { color: pal.tint }, line: NO_LINE })
    const cardBottom = item.highlight ? 5.7 : 6.5

    steps.forEach((step, i) => {
        const cx = 0.8 + colW * (i + 0.5)
        badge(ppt, slide, cx - 0.42, lineY - 0.42, 0.84, pad2(i + 1), i % 2 ? pal.secondary : pal.primary, NEUTRAL.white, 16)
        const x = cx - colW / 2 + 0.12
        slide.addShape(ppt.ShapeType.roundRect, {
            x, y: 3.65, w: colW - 0.24, h: cardBottom - 3.65, rectRadius: 0.14, fill: { color: NEUTRAL.surface }, line: { color: NEUTRAL.border, width: 0.75 },
        })
        slide.addText(`STEP ${i + 1}`, { x: x + 0.22, y: 3.85, w: colW - 0.68, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, charSpacing: 2, color: pal.primary, margin: 0 })
        slide.addText(step, {
            x: x + 0.22, y: 4.2, w: colW - 0.68, h: cardBottom - 4.4, fontFace: FONT, color: NEUTRAL.body, valign: "top", margin: 0,
            fontSize: sizeByLength(step, [[50, 15], [90, 13], [999, 12]]), fit: "shrink",
        })
    })

    if (item.highlight) addHighlight(ppt, slide, pal, item.highlight, 5.95)
    addFooter(ppt, slide, deck, page)
}

const addStatSlide = (ppt, deck, pal, item, index, page) => {
    const slide = ppt.addSlide()
    addHeader(ppt, slide, pal, `${pad2(index)}   ·   BY THE NUMBERS`, item.title)

    slide.addShape(ppt.ShapeType.roundRect, { x: 0.8, y: 2.15, w: 4.5, h: 4.4, rectRadius: 0.18, fill: { color: pal.dark }, line: NO_LINE })
    orb(ppt, slide, 3.75, 4.95, 1.4, pal.primary, 60)
    slide.addText(item.stat.value, {
        x: 1.15, y: 2.55, w: 3.9, h: 1.6, fontFace: FONT, bold: true, color: pal.accent, valign: "middle", margin: 0,
        fontSize: sizeByLength(item.stat.value, [[6, 66], [10, 48], [999, 36]]), fit: "shrink",
    })
    slide.addShape(ppt.ShapeType.rect, { x: 1.15, y: 4.3, w: 0.6, h: 0.05, fill: { color: pal.accent }, line: NO_LINE })
    slide.addText(item.stat.label, { x: 1.15, y: 4.5, w: 3.8, h: 1.7, fontFace: FONT, fontSize: 15, color: "CBD5E1", valign: "top", margin: 0, fit: "shrink" })

    const points = item.points.slice(0, item.highlight ? 4 : 5)
    addChecklist(ppt, slide, pal, points, 5.85, 2.2, 6.65, item.highlight ? 3.4 : 4.3)
    if (item.highlight) {
        slide.addShape(ppt.ShapeType.roundRect, { x: 5.85, y: 5.75, w: 6.65, h: 0.8, rectRadius: 0.12, fill: { color: pal.tint }, line: NO_LINE })
        slide.addText([
            { text: "KEY INSIGHT   ", options: { color: pal.primary, bold: true, fontSize: 10, charSpacing: 2 } },
            { text: item.highlight, options: { color: NEUTRAL.ink, fontSize: 13 } },
        ], { x: 6.1, y: 5.75, w: 6.2, h: 0.8, valign: "middle", fontFace: FONT, margin: 0, fit: "shrink" })
    }
    addFooter(ppt, slide, deck, page)
}

const addTakeaways = (ppt, deck, pal, page) => {
    const slide = ppt.addSlide()
    slide.background = { color: pal.dark }
    orb(ppt, slide, W - 3.2, -2.2, 5.2, pal.primary, 70)
    slide.addText("SUMMARY", { x: 0.8, y: 0.6, w: 6, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, charSpacing: 3, color: pal.accent, margin: 0 })
    slide.addText("Key takeaways", { x: 0.8, y: 0.95, w: 9, h: 0.9, fontFace: FONT, fontSize: 34, bold: true, color: NEUTRAL.white, margin: 0 })

    const items = deck.takeaways.slice(0, 4)
    const gap = 0.3
    const cardW = (W - 1.6 - gap * (items.length - 1)) / items.length
    items.forEach((text, i) => {
        const x = 0.8 + i * (cardW + gap)
        slide.addShape(ppt.ShapeType.roundRect, { x, y: 2.3, w: cardW, h: 3.9, rectRadius: 0.16, fill: { color: pal.darkAlt }, line: { color: NEUTRAL.white, transparency: 88, width: 0.75 } })
        slide.addShape(ppt.ShapeType.rect, { x: x + 0.35, y: 2.3, w: 0.9, h: 0.07, fill: { color: i % 2 ? pal.secondary : pal.accent }, line: NO_LINE })
        slide.addText(pad2(i + 1), { x: x + 0.35, y: 2.65, w: 2, h: 0.8, fontFace: FONT, fontSize: 36, bold: true, color: i % 2 ? pal.secondary : pal.accent, margin: 0 })
        slide.addText(text, { x: x + 0.35, y: 3.6, w: cardW - 0.7, h: 2.4, fontFace: FONT, fontSize: sizeByLength(text, [[70, 17], [120, 15], [999, 13]]), color: "E2E8F0", valign: "top", margin: 0, fit: "shrink" })
    })
    addFooter(ppt, slide, deck, page, { dark: true })
}

const addClosing = (ppt, deck, pal) => {
    const slide = ppt.addSlide()
    slide.background = { color: pal.dark }
    orb(ppt, slide, -2.0, -2.4, 6.0, pal.primary, 60)
    orb(ppt, slide, W - 3.6, H - 3.4, 5.2, pal.secondary, 62)
    orb(ppt, slide, W - 4.6, 1.0, 1.0, pal.accent, 30)
    slide.addText("Thank you", { x: 0, y: 2.3, w: W, h: 1.3, align: "center", fontFace: FONT, fontSize: 60, bold: true, color: NEUTRAL.white, margin: 0 })
    slide.addText("QUESTIONS  &  DISCUSSION", { x: 0, y: 3.65, w: W, h: 0.4, align: "center", fontFace: FONT, fontSize: 14, bold: true, charSpacing: 4, color: pal.accent, margin: 0 })
    slide.addText(deck.title, { x: 1.5, y: 4.4, w: W - 3, h: 0.5, align: "center", fontFace: FONT, fontSize: 14, color: "94A3B8", margin: 0, fit: "shrink" })
    slide.addText("Generated with CortexAI", { x: 0, y: 6.8, w: W, h: 0.3, align: "center", fontFace: FONT, fontSize: 10, color: "64748B", margin: 0 })
}

const chooseLayout = (item, i) => {
    let layout = LAYOUTS.includes(item.layout) ? item.layout : FALLBACK_ROTATION[i % FALLBACK_ROTATION.length]
    if (layout === "stat" && !item.stat) layout = "split"
    if (layout === "process" && (item.points.length < 3 || item.points.length > 5)) layout = "cards"
    return layout
}

const RENDERERS = { cards: addCardsSlide, split: addSplitSlide, process: addProcessSlide, stat: addStatSlide }

export const generatePpt = async (data) => {
    const ppt = new pptxgen()
    ppt.layout = "LAYOUT_WIDE"
    ppt.author = "CortexAI"
    ppt.title = data.title
    ppt.subject = data.subtitle || data.title
    ppt.company = "CortexAI"
    ppt.theme = { headFontFace: FONT, bodyFontFace: FONT }

    const pal = pickPalette(data.title)
    const slides = (data.slides || []).filter(item => item.points?.length)
    const takeaways = Array.isArray(data.takeaways) ? data.takeaways.filter(Boolean) : []
    const hasAgenda = slides.length >= 3
    const deck = {
        title: data.title,
        subtitle: data.subtitle,
        slides,
        takeaways,
        total: 1 + (hasAgenda ? 1 : 0) + slides.length + (takeaways.length ? 1 : 0) + 1,
    }

    let page = 1
    addCover(ppt, deck, pal)
    if (hasAgenda) addAgenda(ppt, deck, pal, ++page)
    slides.forEach((item, i) => {
        RENDERERS[chooseLayout(item, i)](ppt, deck, pal, item, i + 1, ++page)
    })
    if (takeaways.length) addTakeaways(ppt, deck, pal, ++page)
    addClosing(ppt, deck, pal)

    return ppt
}
