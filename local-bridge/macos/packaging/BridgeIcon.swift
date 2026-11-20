import AppKit
import CoreGraphics
import Foundation

// Reproducible, dependency-free macOS icon renderer for CI and local builds.
guard CommandLine.arguments.count == 2 else {
    fputs("Usage: swift BridgeIcon.swift output.png\n", stderr)
    exit(2)
}
let output = CommandLine.arguments[1]
let size = 1024
let space = CGColorSpaceCreateDeviceRGB()
guard let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8,
                          bytesPerRow: 0, space: space,
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    fatalError("Could not create icon context")
}

func rgba(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat, _ a: CGFloat = 1) -> CGColor {
    CGColor(colorSpace: space, components: [r, g, b, a])!
}

func rounded(_ rect: CGRect, _ radius: CGFloat) -> CGPath {
    CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
}

func stroke(_ path: CGPath, _ color: CGColor, width: CGFloat) {
    ctx.addPath(path)
    ctx.setStrokeColor(color)
    ctx.setLineWidth(width)
    ctx.setLineCap(.round)
    ctx.setLineJoin(.round)
    ctx.strokePath()
}

let tile = rounded(CGRect(x: 32, y: 32, width: 960, height: 960), 200)
ctx.addPath(tile)
ctx.clip()
let background = CGGradient(colorsSpace: space,
    colors: [rgba(0.02, 0.10, 0.24), rgba(0.10, 0.09, 0.38), rgba(0.02, 0.04, 0.14)] as CFArray,
    locations: [0, 0.56, 1])!
ctx.drawLinearGradient(background, start: CGPoint(x: 0, y: 1024),
                       end: CGPoint(x: 1024, y: 0), options: [])

// Broad glass light crossing the upper half.
let upper = CGMutablePath()
upper.move(to: CGPoint(x: 30, y: 515))
upper.addCurve(to: CGPoint(x: 992, y: 820),
               control1: CGPoint(x: 400, y: 570), control2: CGPoint(x: 590, y: 1000))
stroke(upper, rgba(0.17, 0.37, 0.80, 0.21), width: 190)

// Left browser window.
let browser = rounded(CGRect(x: 118, y: 250, width: 370, height: 410), 52)
ctx.addPath(browser)
ctx.setFillColor(rgba(0.19, 0.32, 0.68, 0.95))
ctx.fillPath()
stroke(browser, rgba(0.61, 0.84, 1, 0.93), width: 12)
for (i, c) in [rgba(1, 0.37, 0.48), rgba(1, 0.83, 0.29), rgba(0.23, 0.93, 0.50)].enumerated() {
    ctx.setFillColor(c)
    ctx.fillEllipse(in: CGRect(x: 164 + i * 53, y: 563, width: 24, height: 24))
}
for (y, w) in [(478, 220), (422, 168), (366, 120)] {
    stroke(CGPath(roundedRect: CGRect(x: 165, y: y, width: w, height: 12),
                  cornerWidth: 6, cornerHeight: 6, transform: nil),
           rgba(0.82, 0.91, 1, 0.93), width: 9)
}

// Right document, outlined in glass blue.
let paper = rounded(CGRect(x: 560, y: 257, width: 325, height: 410), 48)
ctx.addPath(paper)
ctx.setFillColor(rgba(0.50, 0.64, 0.97, 0.84))
ctx.fillPath()
stroke(paper, rgba(0.89, 0.96, 1, 0.96), width: 13)
let plot = CGMutablePath()
plot.move(to: CGPoint(x: 610, y: 443))
plot.addCurve(to: CGPoint(x: 826, y: 433), control1: CGPoint(x: 688, y: 438), control2: CGPoint(x: 700, y: 620))
stroke(plot, rgba(1, 1, 1, 0.96), width: 12)
stroke(CGPath(roundedRect: CGRect(x: 635, y: 337, width: 195, height: 7),
              cornerWidth: 3, cornerHeight: 3, transform: nil), rgba(0.90, 0.97, 1), width: 8)

// Glowing connective bridge. Draw soft outer strokes first, hard inner stroke last.
let arch = CGMutablePath()
arch.move(to: CGPoint(x: 336, y: 266))
arch.addCurve(to: CGPoint(x: 690, y: 266),
              control1: CGPoint(x: 440, y: 470), control2: CGPoint(x: 572, y: 470))
stroke(arch, rgba(0.06, 0.88, 1, 0.16), width: 122)
stroke(arch, rgba(0.08, 0.92, 1, 0.50), width: 77)
stroke(arch, rgba(0.32, 1.00, 1, 0.96), width: 39)
stroke(arch, rgba(0.80, 1.00, 1, 0.96), width: 7)

// A subtle lower edge keeps the icon legible at 32 px.
stroke(tile, rgba(0.48, 0.66, 1, 0.42), width: 7)

guard let image = ctx.makeImage(),
      let bytes = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else {
    fatalError("Failed to encode icon PNG")
}
try bytes.write(to: URL(fileURLWithPath: output))
print("Wrote icon: \(output)")
