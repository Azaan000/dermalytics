import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def style_cell(cell, text, bold=False, font_size=9, align=WD_ALIGN_PARAGRAPH.LEFT, bg_color=None):
    cell.text = text
    p = cell.paragraphs[0]
    p.alignment = align
    for r in p.runs:
        r.font.size = Pt(font_size)
        r.font.bold = bold
        r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37) # slate-800
    if bg_color:
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_color}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

def create_use_case_tables(doc, uc_id, uc_title, actors, purpose, description, cross_refs, pre_conds, post_conds, events, alt_course):
    """Creates the two standardized specification tables for a use case."""
    
    # Heading paragraph
    p_head = doc.add_paragraph()
    p_head.style = 'Body Text'
    r_head = p_head.add_run(f"{uc_id}: {uc_title}")
    r_head.bold = True
    r_head.font.size = Pt(11)

    # Table 1: Specification
    t1 = doc.add_table(rows=7, cols=2)
    t1.style = 'Table Grid'
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    specs = [
        ('Use Case', f"{uc_id} – {uc_title}"),
        ('Actors', actors),
        ('Purpose', purpose),
        ('Description', description),
        ('Cross References', cross_refs),
        ('Pre-Conditions', pre_conds),
        ('Post-Conditions', post_conds),
    ]
    for row_idx, (label, val) in enumerate(specs):
        style_cell(t1.rows[row_idx].cells[0], label, bold=True, font_size=9)
        style_cell(t1.rows[row_idx].cells[1], val, bold=False, font_size=9)

    # Spacing paragraph
    p_space = doc.add_paragraph()
    p_space.style = 'Normal'

    # Table 2: Typical Course of Events
    total_event_rows = 2 + len(events) + 2
    t2 = doc.add_table(rows=total_event_rows, cols=2)
    t2.style = 'Table Grid'
    t2.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Row 0: Typical Course of Events (spanned/merged)
    t2.rows[0].cells[0].merge(t2.rows[0].cells[1])
    style_cell(t2.rows[0].cells[0], 'Typical Course of Events', bold=True, font_size=9, bg_color='F1F5F9')

    # Row 1: Headers
    style_cell(t2.rows[1].cells[0], 'Actor Action', bold=True, font_size=9, bg_color='F8FAFC')
    style_cell(t2.rows[1].cells[1], 'System Response', bold=True, font_size=9, bg_color='F8FAFC')

    # Event rows
    for idx, (actor_act, sys_resp) in enumerate(events):
        r_num = 2 + idx
        style_cell(t2.rows[r_num].cells[0], actor_act, bold=False, font_size=9)
        style_cell(t2.rows[r_num].cells[1], sys_resp, bold=False, font_size=9)

    # Alternative courses header
    alt_header_row = 2 + len(events)
    t2.rows[alt_header_row].cells[0].merge(t2.rows[alt_header_row].cells[1])
    style_cell(t2.rows[alt_header_row].cells[0], 'Alternative Courses', bold=True, font_size=9, bg_color='F1F5F9')

    # Alternative courses content
    alt_content_row = alt_header_row + 1
    t2.rows[alt_content_row].cells[0].merge(t2.rows[alt_content_row].cells[1])
    style_cell(t2.rows[alt_content_row].cells[0], alt_course, bold=False, font_size=9)

    p_post_space = doc.add_paragraph()
    p_post_space.style = 'Normal'

    return [p_head, t1, p_space, t2, p_post_space]

def run_update():
    doc = docx.Document('G:/dermalytics/Dermalytics_SRS.docx')
    print("Loaded Dermalytics_SRS.docx successfully.")

    # 1. Update Version History (Table 2)
    t_ver = doc.tables[2]
    new_ver_row = t_ver.add_row()
    style_cell(new_ver_row.cells[0], '17-Nov-2026', font_size=9)
    style_cell(new_ver_row.cells[1], '2.0', font_size=9, bold=True)
    style_cell(new_ver_row.cells[2], 'Formalized Waterfall SDLC model; expanded Doctor feature with PMDC specialist locator, clinical second opinions, Grad-CAM telemetry review workspace, FR-09 to FR-12, and use cases UC-11 to UC-14.', font_size=9)
    style_cell(new_ver_row.cells[3], 'Syed Azan Ahmed,\nAsma Ghani, Hania Saeed', font_size=9)
    print("Updated Table 2 (Version History).")

    # 2. Update Abbreviations (Table 3)
    t_abbr = doc.tables[3]
    # Update row 25 (Agile/Sprint -> Waterfall)
    style_cell(t_abbr.rows[25].cells[0], 'Waterfall Model', bold=True, font_size=9)
    style_cell(t_abbr.rows[25].cells[1], 'Classical linear-sequential software development lifecycle consisting of Requirements Analysis, System & Architectural Design, Implementation & Model Training, Integration & System Verification, and Deployment & Telehealth Operations.', font_size=9)
    
    # Add PMDC & Tele-Dermatology
    r_pmdc = t_abbr.add_row()
    style_cell(r_pmdc.cells[0], 'PMDC', bold=True, font_size=9)
    style_cell(r_pmdc.cells[1], 'Pakistan Medical and Dental Council (national statutory regulatory authority for registered medical practitioners).', font_size=9)

    r_td = t_abbr.add_row()
    style_cell(r_td.cells[0], 'Tele-Dermatology', bold=True, font_size=9)
    style_cell(r_td.cells[1], 'Asynchronous store-and-forward evaluation of dermoscopic and trichoscopic imagery by certified medical specialists.', font_size=9)
    print("Updated Table 3 (Abbreviations).")

    # 3. Update Table 4 (Intended Audience)
    t_aud = doc.tables[4]
    style_cell(t_aud.rows[2].cells[1], 'Use the functional requirements, architectural interfaces and use cases as the formal baseline for sequential architectural design, deep learning model training, and phase-wise implementation under the Waterfall model.', font_size=9)
    style_cell(t_aud.rows[3].cells[1], 'Derive formal verification test suites for unit, integration, usability, Grad-CAM explainability, and clinical validation during Phase 4 (System Verification & Testing).', font_size=9)
    print("Updated Table 4 (Audience).")

    # 4. Update Table 5 (Stakeholders)
    t_stake = doc.tables[5]
    style_cell(t_stake.rows[3].cells[2], 'Design, build, verify and document the platform across the five sequential Waterfall project phases.', font_size=9)
    style_cell(t_stake.rows[5].cells[1], 'Local PMDC-registered dermatologists and trichologists across Karachi (Clifton, Stadium Rd, Gulshan, PECHS, North Nazimabad), Lahore, and Islamabad.', font_size=9)
    style_cell(t_stake.rows[5].cells[2], 'Participate in the Clinician Portal to evaluate patient scan submissions, review Explainable AI Grad-CAM heatmaps, provide asynchronous second opinions, and issue digital diagnostic sign-offs.', font_size=9)
    print("Updated Table 5 (Stakeholders).")

    # 5. Update Table 7 (Software Interfaces)
    t_sw = doc.tables[7]
    style_cell(t_sw.rows[8].cells[2], 'Version control, Waterfall milestone tracking (GitHub / Gantt), and automated REST API verification.', font_size=9)
    r_maps = t_sw.add_row()
    style_cell(r_maps.cells[0], 'Google Maps Platform & Geolocation', font_size=9)
    style_cell(r_maps.cells[1], 'Google LLC', font_size=9)
    style_cell(r_maps.cells[2], 'Browser Geolocation API and Google Maps navigation integration for specialist clinic discovery, distance calculation, and routing.', font_size=9)
    print("Updated Table 7 (Software Interfaces).")

    # 6. Update Section 2 text paragraphs (Scope, Objectives, Constraints)
    for p in doc.paragraphs:
        txt = p.text
        if 'The objective of the project is to develop an AI-powered skin and hair health assessment platform using an Agile approach' in txt:
            p.text = "The objective of the project is to develop an AI-powered skin and hair health assessment platform following the classical Waterfall Model lifecycle, ensuring formal requirements engineering, robust architectural design, rigorous model training and verification, and an integrated telehealth expansion for specialist clinical review. Specific objectives are:"
        elif 'The project is limited to a team of three and to the schedule of nine sprints' in txt:
            p.text = "The project is executed by a team of three following the classical Waterfall Model across five distinct, sequential phases (Requirements Engineering, Architectural & System Design, Implementation & Model Training, Integration & System Verification, Deployment & Telehealth Operations) from September 2026 to February 2027."
        elif 'Partnership with a local dermatologist, only if Sprint 2 shows' in txt:
            p.text = "Partnership with local PMDC-registered dermatologists across Karachi, Lahore, and Islamabad to support clinical second opinions and telemetry validation established during the Requirements & Design phases."
        elif 'Clinical-grade diagnosis, and prescription or treatment recommendations.' in txt:
            p.text = "Direct autonomous clinical diagnosis without human doctor validation, and automated invasive prescription generation (while asynchronous assistive second-opinion review and non-invasive care plans by licensed PMDC doctors are supported, in-person biopsy and histopathology remain the definitive medical gold standard)."
        elif '[10] Beck, K., et al.' in txt and 'Manifesto for Agile Software Development' in txt:
            p.text = "[10] Royce, W. W., “Managing the Development of Large Software Systems: Concepts and Techniques,” Proceedings of IEEE WESCON, vol. 26, pp. 1–9, August 1970 (Foundational Waterfall Life Cycle Architecture)."

    # Append new scope items to Section 2.4 (Project Scope)
    # Find paragraph 88
    for i, p in enumerate(doc.paragraphs):
        if 'Platform delivery model: Dermalytics is built and deployed as one responsive' in p.text:
            p_scope1 = doc.add_paragraph()
            p_scope1.style = 'Normal'
            p_scope1.text = "• Specialist Directory & Proximity Locator: Verified PMDC-registered dermatologists and trichologists directory across Karachi (Clifton, Stadium Road, Gulshan-e-Iqbal, PECHS, North Nazimabad), Lahore, and Islamabad with Haversine proximity calculations, clinic direct channels (Call/WhatsApp), consultation fee transparency, and Google Maps routing."
            p._p.addnext(p_scope1._p)

            p_scope2 = doc.add_paragraph()
            p_scope2.style = 'Normal'
            p_scope2.text = "• Asynchronous Tele-Dermatology Second Opinions: Collaborative clinical workflow enabling users to request second-opinion evaluations, and enabling registered clinicians to review Explainable AI Grad-CAM heatmaps, evaluate concordance, prescribe personalized care recommendations, and provide certified digital sign-offs."
            p_scope1._p.addnext(p_scope2._p)
            print("Added doctor locator and second-opinion scope bullets.")
            break

    # 7. Update Table 9 (System Functions / Functional Requirements)
    t_fn = doc.tables[9]
    # Update R5.2 note
    style_cell(t_fn.rows[15].cells[4], 'Only consented reports are used; feeds the periodic retraining cycle during Phase 4 and Phase 5.', font_size=9)
    
    # Add R6.1 to R6.4
    new_fns = [
        ('R6.1', 'Discover certified local dermatologists and trichologists with proximity calculation (FR-9)', 'Evident', 'Usability', 'Filters by city (Karachi, Lahore, Islamabad), area (Clifton, PECHS, Gulshan, etc.), and Haversine distance in km.'),
        ('R6.2', 'Request specialist clinical second-opinion review on an AI scan (FR-10)', 'Evident', 'Telehealth', 'Patient submits scan with optional symptoms/history for review by a selected PMDC doctor.'),
        ('R6.3', 'Dedicated Clinician Assessment Workspace with side-by-side Grad-CAM telemetry (FR-11)', 'Evident', 'Clinical Support', 'Doctor logs in, inspects patient images and explainability maps, and reviews model confidence.'),
        ('R6.4', 'Submit certified second-opinion sign-off with concordance and care orders (FR-12)', 'Evident', 'Clinical Governance', 'Doctor verifies/adjusts diagnosis, sets urgency, prescribes plan, and attaches PMDC signature to report.')
    ]
    for r_ref, r_name, r_cat, r_attr, r_detail in new_fns:
        r_new = t_fn.add_row()
        style_cell(r_new.cells[0], r_ref, bold=True, font_size=9)
        style_cell(r_new.cells[1], r_name, font_size=9)
        style_cell(r_new.cells[2], r_cat, font_size=9)
        style_cell(r_new.cells[3], r_attr, font_size=9)
        style_cell(r_new.cells[4], r_detail, font_size=9)
    print("Added FR-09 to FR-12 in Table 9.")

    # 8. Update List of Actors (Section 4.2.1)
    for p in doc.paragraphs:
        if 'AI Inference Service; secondary (system) actor: the backend service that runs' in p.text:
            p_doc_actor = doc.add_paragraph()
            p_doc_actor.style = 'Normal'
            p_doc_actor.text = "Doctor / Clinician; authenticated PMDC-registered medical professional who accesses the clinical portal, evaluates patient scan submissions, reviews Explainable AI Grad-CAM heatmaps, provides clinical second opinions, adjusts/confirms classifications, formulates care plans, and signs off diagnostic telemetry reports."
            p._p.addnext(p_doc_actor._p)
            print("Added Doctor / Clinician actor in Section 4.2.1.")
            break

    # 9. Update Table 11 (Use Cases List)
    t_uc = doc.tables[11]
    new_ucs = [
        ('UC-11', 'Locate Nearby Specialists', 'A visitor or registered user searches and filters verified PMDC dermatologists by city, area, specialty, or proximity.', 'Visitor, Registered User'),
        ('UC-12', 'Request Specialist Second Opinion', 'A registered user requests an asynchronous clinical second opinion on a completed AI scan.', 'Registered User'),
        ('UC-13', 'Review Patient Scan & Heatmap Telemetry', 'An authenticated doctor inspects a patient’s scan, diagnostic confidence, and Grad-CAM explainability overlay.', 'Doctor / Clinician'),
        ('UC-14', 'Submit Clinical Feedback & Certified Sign-off', 'The doctor submits a clinical impression, concordance evaluation, care orders, and signs the consultation report.', 'Doctor / Clinician')
    ]
    for uc_id, uc_name, uc_desc, uc_actor in new_ucs:
        r_uc = t_uc.add_row()
        style_cell(r_uc.cells[0], uc_id, bold=True, font_size=9)
        style_cell(r_uc.cells[1], uc_name, font_size=9, bold=True)
        style_cell(r_uc.cells[2], uc_desc, font_size=9)
        style_cell(r_uc.cells[3], uc_actor, font_size=9)
    print("Added UC-11 through UC-14 in Table 11.")

    # 10. Insert Detailed Specifications for UC-11 to UC-14
    # Find paragraph of Section 5 "Non - Functional Requirements"
    target_p = None
    for p in doc.paragraphs:
        if 'Non - Functional Requirements' in p.text:
            target_p = p
            break

    if not target_p:
        raise ValueError("Could not find 'Non - Functional Requirements' paragraph")

    # Define use cases details
    uc_definitions = [
        (
            'UC-11', 'Locate Nearby Specialists',
            'Visitor, Registered User',
            'Search and discover verified PMDC dermatologists and trichologists across Pakistani cities (Karachi, Lahore, Islamabad) with proximity sorting.',
            'The user queries the specialist directory, applies filters for city, area, and specialty, calculates distance via device geolocation, and accesses clinic contact, WhatsApp consultation, and Google Maps links.',
            'Functions: R6.1 (FR-9)',
            'The user navigates to the Find Specialists tab.',
            'A filtered list of qualified specialists is displayed with PMDC credentials, fees, and location metrics.',
            [
                ('1. Selects city (e.g., Karachi), area (e.g., Clifton), or clicks "Sort by Proximity".', ''),
                ('', '2. Obtains user coordinates, calculates Haversine distance, and queries the specialist database.'),
                ('', '3. Returns sorted doctor profiles with PMDC license numbers, ratings, fees, and contact links.'),
                ('4. Clicks Call, WhatsApp, or Google Maps directions.', ''),
                ('', '5. Launches the external communications channel or navigation map.')
            ],
            'Step 2: Geolocation access denied. The system displays a fallback notice and defaults to city center coordinates with manual area selection.'
        ),
        (
            'UC-12', 'Request Specialist Second Opinion',
            'Registered User',
            'Submit an AI-assessed skin lesion or hair scan to a licensed dermatologist for human clinical review.',
            'The user selects an assessment, chooses a preferred specialist (or first available), enters subjective symptoms/history, and requests an asynchronous second opinion.',
            'Functions: R6.2 (FR-10)',
            'The user is authenticated and has at least one completed scan assessment.',
            'A review request is placed in the specialist’s clinical triage queue with "pending" status.',
            [
                ('1. Clicks "Request Specialist Review" on an assessment result or history item.', ''),
                ('', '2. Renders the Second Opinion modal with scan preview and verified doctors dropdown.'),
                ('3. Selects doctor, enters symptoms and medical history, and clicks "Submit for Review".', ''),
                ('', '4. Validates request, records the entry in the review database, and updates status to pending.'),
                ('', '5. Displays confirmation message with expected turnaround time (2–4 hours).')
            ],
            'Step 4: Request fails due to network disruption. The system displays an error and prompts the user to retry.'
        ),
        (
            'UC-13', 'Review Patient Scan & Heatmap Telemetry',
            'Doctor / Clinician',
            'Inspect a patient’s uploaded scan, model inference results, and Grad-CAM visual explainability heatmap.',
            'An authenticated PMDC doctor opens their clinical workspace, selects a pending review, toggles between original dermoscopy and Grad-CAM heatmaps, and inspects patient-reported history.',
            'Functions: R6.3 (FR-11)',
            'The user is logged in with verified doctor credentials (is_doctor = True).',
            'The full clinical telemetry package is presented in the review workspace.',
            [
                ('1. Navigates to the Doctor Portal and selects a pending case from the queue.', ''),
                ('', '2. Loads high-resolution scan, patient notes, AI classification, confidence score, and Grad-CAM overlay.'),
                ('3. Toggles between raw dermoscopy and Explainable AI attention maps to evaluate lesion borders and pigment networks.', ''),
                ('', '4. Renders interactive side-by-side comparison.')
            ],
            'Step 2: No reviews in queue. The system displays an empty queue notice and status indicator.'
        ),
        (
            'UC-14', 'Submit Clinical Feedback & Certified Sign-off',
            'Doctor / Clinician',
            'Formulate a clinical impression, evaluate concordance with the AI, establish a care plan, and sign off the report.',
            'The examining doctor specifies agreement/disagreement with AI predictions, enters clinical diagnostic impressions and guidance, assigns follow-up timeframe and triage urgency, and submits the digital sign-off.',
            'Functions: R6.4 (FR-12)',
            'The doctor is reviewing an active case in the Clinician Assessment Workspace.',
            'The review status is updated to "completed" and digitally attached with the doctor’s PMDC credentials to the patient’s record and downloadable PDF report.',
            [
                ('1. Completes the clinical evaluation form (concordance toggle, diagnostic impression, treatment notes, urgency, follow-up days).', ''),
                ('2. Clicks "Sign & Submit Clinical Review".', ''),
                ('', '3. Validates inputs, persists clinical evaluation, records timestamp, and attaches PMDC credentials.'),
                ('', '4. Updates review status to "completed" and refreshes the pending queue.'),
                ('', '5. Generates the verified PDF report stamp containing doctor’s signature and hospital affiliation.')
            ],
            'Step 1: Clinical impression field empty. The system prompts the doctor to complete required fields before sign-off.'
        )
    ]

    for uc_args in uc_definitions:
        elements = create_use_case_tables(doc, *uc_args)
        # Move elements before target_p
        for elem in elements:
            if hasattr(elem, '_p'):
                target_p._p.addprevious(elem._p)
            elif hasattr(elem, '_tbl'):
                target_p._p.addprevious(elem._tbl)

    print("Inserted detailed specification tables for UC-11, UC-12, UC-13, and UC-14.")

    # 11. Update Non-Functional Requirements (Table 37 and Table 38)
    t37 = doc.tables[37]
    style_cell(t37.rows[1].cells[1], 'The codebase shall be modular, with separate model-serving, API and frontend layers so each Waterfall architectural phase can be systematically verified, audited, and maintained.', font_size=9)

    t38 = doc.tables[38]
    style_cell(t38.rows[1].cells[1], 'Comprehensive technical documentation, architecture blueprints, and a final verification report shall be prepared in Phase 4 (Verification) and delivered in Phase 5.', font_size=9)
    print("Updated Table 37 and Table 38 (NFRs).")

    # Save updated document
    doc.save('G:/dermalytics/Dermalytics_SRS.docx')
    print("Successfully saved updated G:/dermalytics/Dermalytics_SRS.docx!")

if __name__ == '__main__':
    run_update()
