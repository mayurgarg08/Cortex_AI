import { strict as assert } from "node:assert"
import { generatePdf } from "../utils/generatePdf.js"
import { generatePpt } from "../utils/generatePpt.js"
import { parseStructuredResponse } from "../utils/parseStructuredResponse.js"

const pdfData = parseStructuredResponse(JSON.stringify({
  title: "Test document",
  subtitle: "Smoke test",
  sections: [{ heading: "Section", points: ["One", "Two"] }]
}), "sections")

const pptData = parseStructuredResponse(JSON.stringify({
  title: "Test presentation",
  subtitle: "Smoke test",
  slides: [{ title: "Slide", points: ["One", "Two"] }]
}), "slides")

for (let iteration = 1; iteration <= 3; iteration += 1) {
  const pdf = await generatePdf(pdfData)
  const presentation = await generatePpt(pptData)
  const ppt = await presentation.write({ outputType: "nodebuffer" })

  assert.ok(pdf.length > 0, "PDF output must not be empty")
  assert.ok(ppt.length > 0, "PPT output must not be empty")
  console.log(`iteration ${iteration}: pdf=${pdf.length}, ppt=${ppt.length}`)
}
