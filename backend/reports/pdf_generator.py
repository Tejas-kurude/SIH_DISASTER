import os
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from config import REPORTS_DIR

def generate_collector_directive_pdf(optimization_result: dict, district_name: str = "Kolhapur / Western Ghats") -> str:
    """
    Generates official District Collector Emergency Relocation Directive PDF Order.
    """
    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"District_Collector_Relocation_Order_{timestamp_str}.pdf"
    file_path = REPORTS_DIR / file_name

    doc = SimpleDocTemplate(
        str(file_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'GovTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        alignment=1
    )

    subtitle_style = ParagraphStyle(
        'GovSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#BE123C'),
        alignment=1
    )

    body_style = ParagraphStyle(
        'GovBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    bold_body = ParagraphStyle(
        'GovBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Header
    story.append(Paragraph("GOVERNMENT OF MAHARASHTRA / NDMA DISASTER CONTROL CELL", title_style))
    story.append(Paragraph("OFFICE OF THE DISTRICT MAGISTRATE & DISASTER MANAGEMENT AUTHORITY", ParagraphStyle('SubSub', parent=title_style, fontSize=11, leading=14, textColor=colors.HexColor('#1E293B'))))
    story.append(Spacer(1, 4))
    story.append(Paragraph("EMERGENCY DIRECTIVE: MATHEMATICALLY OPTIMIZED RELOCATION WORK ORDER", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=2, spaceAfter=8))

    # Reference Details
    ref_date = datetime.datetime.now().strftime("%d %B %Y, %H:%M IST")
    ref_text = f"<b>Order Ref:</b> DMA/NDMA/RELOC/{datetime.datetime.now().strftime('%Y/%m/%d-09')}<br/>" \
               f"<b>District Authority:</b> {district_name}<br/>" \
               f"<b>Date & Time of Issuance:</b> {ref_date}<br/>" \
               f"<b>Algorithm:</b> PuLP Mixed-Integer Linear Programming (MILP Capacity Optimization Engine)"
    story.append(Paragraph(ref_text, body_style))
    story.append(Spacer(1, 10))

    # Executive Summary Box
    total_persons = optimization_result.get("total_persons_relocated", 1740)
    total_families = optimization_result.get("total_families_relocated", 411)
    summary_html = f"<b>EXECUTIVE DIRECTIVE:</b> Under Section 34 of the Disaster Management Act, 2005, immediate mandatory evacuation and relocation is hereby ordered for <b>{total_persons:,} residents ({total_families} families)</b> across the designated Red Hazard Inundation Zones. All displaced habitations are assigned to optimal Green Safe Parcels according to mathematically constrained carrying capacity."
    story.append(Paragraph(summary_html, body_style))
    story.append(Spacer(1, 12))

    # Relocation Table
    table_data = [
        [
            Paragraph("<b>Habitation Name</b>", bold_body),
            Paragraph("<b>Hazard Risk Level</b>", bold_body),
            Paragraph("<b>Families</b>", bold_body),
            Paragraph("<b>Assigned Resettlement Site</b>", bold_body),
            Paragraph("<b>Dist (km)</b>", bold_body),
            Paragraph("<b>Priority</b>", bold_body),
        ]
    ]

    assignments = optimization_result.get("assignments", [])
    for row in assignments:
        is_crit = "IMMEDIATE" in row.get("priority", "")
        p_color = "#E11D48" if is_crit else "#D97706"

        table_data.append([
            Paragraph(row.get("habitation_name", ""), body_style),
            Paragraph(f"<font color='{p_color}'><b>{row.get('risk_level', '')}</b></font>", body_style),
            Paragraph(f"<b>{row.get('families', 0)}</b>", body_style),
            Paragraph(row.get("assigned_site_name", ""), body_style),
            Paragraph(f"{row.get('relocation_distance_km', 0)} km", body_style),
            Paragraph(f"<font color='{p_color}'><b>{row.get('priority', '')}</b></font>", body_style),
        ])

    reloc_table = Table(table_data, colWidths=[110, 110, 48, 145, 52, 75])
    reloc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    story.append(reloc_table)
    story.append(Spacer(1, 14))

    # Tactical Directives
    story.append(Paragraph("<b>OPERATIONAL PROTOCOLS & IMMEDIATE ACTIONS:</b>", bold_body))
    story.append(Paragraph("1. <b>NDRF & SDRF Deployment:</b> Rapid response teams are mobilized along marked safe evacuation corridors.", body_style))
    story.append(Paragraph("2. <b>Transport Fleet:</b> State Transport (MSRTC) buses are assigned to Shahu Textile Colony & Ghat Slopes.", body_style))
    story.append(Paragraph("3. <b>Ration & Medical Aid:</b> 14-day dry ration kits and mobile medical dispensaries established at all 4 Safe Parcels.", body_style))
    story.append(Spacer(1, 18))

    # Signatures
    sig_data = [
        [
            Paragraph("<b>Prepared by:</b><br/>AI Disaster Relocation Engine<br/>TERRA-AI / NDMA Tech Core", body_style),
            Paragraph("<b>Approved & Ordered by:</b><br/><b>District Magistrate & Collector</b><br/>District Disaster Management Authority", bold_body)
        ]
    ]
    sig_table = Table(sig_data, colWidths=[260, 280])
    story.append(sig_table)

    doc.build(story)
    return str(file_path)
