from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Table, TableStyle

OUTPUT = Path(__file__).resolve().parents[1] / "dist/evidence/markitdown-pdf/support-notes.pdf"
INK = colors.HexColor("#182b32")
LABEL = colors.HexColor("#376054")

doc = Canvas(str(OUTPUT), pagesize=letter, invariant=1)
doc.setTitle("Synthetic support notes")
doc.setAuthor("iPunk AI Radar")


def header(label, title):
    doc.setFillColor(LABEL)
    doc.setFont("Helvetica", 11)
    doc.drawString(60, 726, label)
    doc.setFillColor(INK)
    doc.setFont("Helvetica-Bold", 29)
    doc.drawString(60, 686, title)


def text_line(y, value):
    doc.setFillColor(INK)
    doc.setFont("Helvetica", 13)
    doc.drawString(60, y, value)


header("SUPPORT NOTES / 1", "Setup and review")
text_line(628, "Ticket BASIC-52 requires supervisor review.")
text_line(602, "Contact the support desk before extending retention.")
text_line(576, "Use the retention table on page 2.")
doc.showPage()

header("SUPPORT NOTES / 2", "Retention by tier")
table = Table(
    [["Tier", "Retention", "Review"], ["Standard", "14 days", "Monthly"], ["Extended", "45 days", "Weekly"]],
    colWidths=[156, 156, 156],
    rowHeights=[36, 36, 36],
)
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e1eee8")),
    ("GRID", (0, 0), (-1, -1), 0.6, LABEL),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 12),
    ("TEXTCOLOR", (0, 0), (-1, -1), INK),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]))
table.wrapOn(doc, 468, 108)
table.drawOn(doc, 60, 522)
text_line(478, "Times apply only to the tier on the same row.")
doc.showPage()

image = Image.new("RGB", (1224, 1584), "#faf9f2")
draw = ImageDraw.Draw(image)
draw.text((120, 118), "SUPPORT NOTES / 3", font=ImageFont.load_default(size=24), fill="#376054")
draw.text((120, 194), "Scanned exception notice", font=ImageFont.load_default(size=56), fill="#182b32")
draw.line((120, 285, 1050, 285), fill="#376054", width=3)
body = ImageFont.load_default(size=36)
draw.text((120, 348), "Exception SCAN-43 requires escalation.", font=body, fill="#182b32")
draw.text((120, 414), "Escalate within 72 hours.", font=body, fill="#182b32")
encoded = BytesIO()
image.save(encoded, format="PNG")
encoded.seek(0)
doc.drawImage(ImageReader(encoded), 0, 0, width=612, height=792)
doc.showPage()
doc.save()
