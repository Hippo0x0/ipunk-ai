import Foundation
import Vision

guard CommandLine.arguments.count == 2 else {
    fputs("Usage: swift ocr-page.swift page.png\n", stderr)
    exit(2)
}

let image = URL(fileURLWithPath: CommandLine.arguments[1])
let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["en-US"]

do {
    try VNImageRequestHandler(url: image).perform([request])
    let lines = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    guard !lines.isEmpty else {
        fputs("No text recognized. Check the input image.\n", stderr)
        exit(1)
    }
    print(lines.joined(separator: "\n"))
} catch {
    fputs("OCR could not read the image: \(error.localizedDescription)\n", stderr)
    exit(1)
}
