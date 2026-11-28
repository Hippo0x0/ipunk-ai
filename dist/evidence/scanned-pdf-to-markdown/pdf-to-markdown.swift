import AppKit
import Foundation
import PDFKit
import Vision

struct ConversionError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

func ocrText(for page: PDFPage) throws -> String {
    let bounds = page.bounds(for: .cropBox)
    let longEdge = max(bounds.width, bounds.height)
    guard longEdge.isFinite, longEdge > 0, min(bounds.width, bounds.height) > 0 else {
        throw ConversionError(message: "Invalid PDF page dimensions.")
    }
    let scale = 2200 / longEdge
    let size = NSSize(width: max(1, bounds.width * scale), height: max(1, bounds.height * scale))
    let rendered = page.thumbnail(of: size, for: .cropBox)
    guard let image = rendered.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        throw ConversionError(message: "Could not render the PDF page.")
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["en-US"]
    try VNImageRequestHandler(cgImage: image).perform([request])
    let lines = (request.results ?? []).sorted { $0.boundingBox.midY > $1.boundingBox.midY }
    return lines.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
}

func fencedText(_ text: String) -> String {
    let longest = text.split(whereSeparator: { $0 != "`" }).map(\.count).max() ?? 0
    let fence = String(repeating: "`", count: max(3, longest + 1))
    return "\(fence)text\n\(text)\n\(fence)"
}

func convert(_ args: [String]) throws {
    let usage = "Usage: swift pdf-to-markdown.swift input.pdf output.md [--ocr-pages 3,5]"
    guard args.count == 2 || (args.count == 4 && args[2] == "--ocr-pages") else {
        throw ConversionError(message: usage)
    }
    let input = URL(fileURLWithPath: args[0])
    let output = URL(fileURLWithPath: args[1])
    guard !FileManager.default.fileExists(atPath: output.path) else {
        throw ConversionError(message: "The output already exists. Choose a new path.")
    }
    guard let document = PDFDocument(url: input), !document.isLocked, document.pageCount > 0 else {
        throw ConversionError(message: "Could not open an unlocked, non-empty PDF.")
    }

    var forcedPages = Set<Int>()
    if args.count == 4 {
        for value in args[3].split(separator: ",", omittingEmptySubsequences: false) {
            guard let page = Int(value), (1...document.pageCount).contains(page) else {
                throw ConversionError(message: "--ocr-pages needs comma-separated page numbers in 1...\(document.pageCount).")
            }
            forcedPages.insert(page)
        }
    }

    var sections: [String] = []
    var pagesWithoutText: [Int] = []
    for position in 1...document.pageCount {
        guard let page = document.page(at: position - 1) else {
            throw ConversionError(message: "Could not open page \(position). No output was written.")
        }
        let layer = (page.string ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let needsOCR = layer.isEmpty || forcedPages.contains(position)
        let mode = needsOCR ? "OCR (English)" : "PDF text layer"
        let text: String
        do {
            text = needsOCR ? try ocrText(for: page) : layer
        } catch {
            throw ConversionError(message: "OCR failed on page \(position). No output was written. \(error.localizedDescription)")
        }

        if text.isEmpty {
            pagesWithoutText.append(position)
        }
        let body = text.isEmpty ? "No text recovered." : fencedText(text)
        sections.append("## Page \(position)\n\nText source: \(mode)\n\n\(body)")
    }
    let markdown = sections.joined(separator: "\n\n") + "\n"
    try Data(markdown.utf8).write(to: output, options: .withoutOverwriting)

    if !pagesWithoutText.isEmpty {
        let pages = pagesWithoutText.map(String.init).joined(separator: ", ")
        fputs("No text was recovered on pages \(pages). Review those pages in the PDF.\n", stderr)
    }
    print("Wrote Markdown for \(document.pageCount) pages to \(output.path).")
}

do {
    try convert(Array(CommandLine.arguments.dropFirst()))
} catch {
    fputs("\(error.localizedDescription)\n", stderr)
    exit(1)
}
