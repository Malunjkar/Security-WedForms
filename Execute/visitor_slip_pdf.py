from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from Execute.executesql import get_connection


def fetch_visitor_from_db(n_sr_no):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s_location_code,
            dt_visit_datetime,
            s_visitor_name,
            s_visitor_pass_no,
            s_whom_to_meet
        FROM dbo.VISITOR_DECLARATION_SLIP
        WHERE n_sr_no = ?
    """, (n_sr_no,))

    r = cursor.fetchone()
    cursor.close()
    conn.close()

    # ===================== CHANGE 1 START =====================
    visit_dt = r[1]

    formatted_date = visit_dt.strftime("%Y-%m-%d") if visit_dt else ""
    formatted_time = visit_dt.strftime("%H:%M") if visit_dt else ""
    # ===================== CHANGE 1 END =====================

    return {
        "location": r[0],
        "datetime": str(r[1]),
        "date": formatted_date,   
        "time": formatted_time,  
        "visitor": r[2],
        "pass_no": r[3],
        "meet": r[4]
    }


def generate_visitor_slip_pdf(data):
    if "n_sr_no" in data:
        data = fetch_visitor_from_db(data["n_sr_no"])

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()
    elements = []

    # ---------------- HEADER ----------------
    elements.append(Paragraph(
        "<b>PIL VISITOR DECLARATION SLIP</b>",
        ParagraphStyle("title", alignment=TA_CENTER, fontSize=14)
    ))

    elements.append(Paragraph(
        "(Returnable Material)",
        ParagraphStyle("subtitle", alignment=TA_CENTER, fontSize=11)
    ))

    elements.append(Spacer(1, 15))

    # ---------------- MAIN TEXT ----------------
    elements.append(Paragraph(
        f"I {data.get('visitor','    ')}, Visitor pass No. {data.get('pass_no','')}",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"want to meet Mr./Mrs. {data.get('meet','')} and carrying",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        "following sample/material inside the PIL premises up to ______ Same",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        "will be returned after approval/rejection/visit.",
        styles["Normal"]
    ))

    elements.append(Spacer(1, 20))

    # ---------------- ITEM TABLE ----------------
    table_data = [["Sr No.", "ITEM CODE / DESCRIPTION", "UOM", "QUANTITY"]]

    for i in range(1, 11):
        table_data.append([str(i), "", "", ""])

    table = Table(table_data, colWidths=[60, 260, 80, 100])

    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    # =====================  START =====================
    elements.append(Paragraph(
        f"Time: {data.get('time','')}",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"Date: {data.get('date','')}",
        styles["Normal"]
    ))
    # ===================== END =====================

    elements.append(Spacer(1, 10))

    elements.append(Paragraph("Visitor Signature: ____________________", styles["Normal"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("Checked By: ____________________", styles["Normal"]))
    elements.append(Paragraph("Name & Sign of Security", styles["Normal"]))

    doc.build(elements)

    buffer.seek(0)
    filename = f"Visitor_Slip_{datetime.now().strftime('%Y%m%d')}.pdf"

    return buffer, filename
