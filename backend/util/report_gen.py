from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np

def create_parameter_graphs(graph_data):
    graphs = []
    attempts = [1, 2, 3, 4, 5]  # Explicit attempt numbers
    
    for param, values in graph_data.items():
        plt.figure(figsize=(8, 4))
        
        plt.plot(attempts, values, marker='o', linewidth=2)
        
        avg = np.mean(values)
        plt.axhline(y=avg, color='r', linestyle='--', label=f'Average: {avg:.2f}')
        
        plt.title(f'{param.replace("_", " ").title()} Over Time')
        plt.xlabel('Attempt Number')
        plt.ylabel('Score')
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.xticks(attempts)  # Set x-axis ticks to show exact attempt numbers
        plt.legend()
        
        filename = f'temp_{param}_graph.png'
        plt.savefig(filename, bbox_inches='tight', dpi=300)
        plt.close()
        
        graphs.append(filename)
    
    return graphs

def generate_feedback_report(feedback_data, graph_data, output_path="interview_feedback_report.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        textColor=colors.HexColor('#2C3E50')
    )
    
    # Content elements
    elements = []
    
    # Header
    elements.append(Paragraph("Candidate Assessment Report", title_style))
    elements.append(Paragraph(f"Candidate Name: John Doe", styles['Normal']))
    elements.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Overall Feedback
    elements.append(Paragraph("Overall Assessment", heading_style))
    elements.append(Paragraph(f"Summary: {feedback_data['overall_feedback']['summary']}", styles['Normal']))
    elements.append(Spacer(1, 10))
    
    # Key Strengths and Areas of Improvement
    elements.append(Paragraph("Key Strengths:", styles['Heading3']))
    elements.append(Paragraph(feedback_data['overall_feedback']['key_strengths'], styles['Normal']))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("Areas of Improvement:", styles['Heading3']))
    elements.append(Paragraph(feedback_data['overall_feedback']['areas_of_improvement'], styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Detailed Analysis
    elements.append(Paragraph("Detailed Analysis", heading_style))
    
    # Create paragraph style for table cells
    styles = getSampleStyleSheet()
    cell_style = ParagraphStyle(
        'CellStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        wordWrap='CJK'
    )
    
    # Format table data with paragraphs for proper wrapping
    speaking_data = [
        ['Metric', 'Score', 'Comments'],
        [
            Paragraph('Speaking Rate', cell_style),
            Paragraph(str(feedback_data['advanced']['speaking_rate']['rate']), cell_style),
            Paragraph(feedback_data['advanced']['speaking_rate']['comment'], cell_style)
        ],
        [
            Paragraph('Filler Words', cell_style),
            Paragraph(str(feedback_data['advanced']['filler_word_usage']['count']), cell_style),
            Paragraph(feedback_data['advanced']['filler_word_usage']['comment'], cell_style)
        ],
        [
            Paragraph('Pauses', cell_style),
            Paragraph(str(feedback_data['advanced']['pause_pattern']['count']), cell_style),
            Paragraph(feedback_data['advanced']['pause_pattern']['comment'], cell_style)
        ]
    ]
    
    # Create table with adjusted column widths
    table = Table(speaking_data, colWidths=[1.2*inch, 0.8*inch, 4.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C3E50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Actionable Recommendations
    elements.append(Paragraph("Actionable Recommendations", heading_style))
    for i, rec in enumerate(feedback_data['advanced']['actionable_recommendations'], 1):
        elements.append(Paragraph(f"{i}. {rec['recommendation']}", styles['Normal']))
        elements.append(Paragraph(f"   Reason: {rec['reason']}", styles['Italic']))
        elements.append(Spacer(1, 10))
    
    # Graphs
    elements.append(Paragraph("Performance Trends", heading_style))
    elements.append(Spacer(1, 10))
    
    graph_files = create_parameter_graphs(graph_data)
    for graph_file in graph_files:
        elements.append(Image(graph_file, width=6*inch, height=3*inch))
        elements.append(Spacer(1, 10))
    
    # Build PDF
    doc.build(elements)
    
    # Clean up temporary graph files
    for graph_file in graph_files:
        import os
        os.remove(graph_file)

    return output_path

test = {"advanced": {"actionable_recommendations": [{"reason": "Improving these aspects will create a more polished and professional communication style.", "recommendation": "Focus on reducing filler words, enhancing the clarity and conciseness of your responses, and providing specific examples to support your points."}, {"reason": "Consistent pacing and well-placed pauses will improve the flow and impact of your communication.", "recommendation": "Practice maintaining a consistent speaking pace and using pauses strategically for emphasis."}, {"reason": "Adding detail and quantifiable achievements will strengthen your responses.", "recommendation": "Whenever possible, quantify your achievements and provide specific details to illustrate your skills and experience."}], "articulation": "Generally clear, but inconsistencies exist across responses. Some sections were rushed, while others lacked necessary emphasis.", "enunciation": "Mostly clear, but some words were slurred or dropped, particularly during faster speaking segments.", "filler_word_usage": {"comment": "The frequency of filler words varied across responses, indicating inconsistency in preparation and delivery. Excessive filler words detract from professionalism.", "count": 10}, "intelligibility": "Responses were mostly intelligible. However, occasional mumbling or rushed speech impacted clarity.", "pause_pattern": {"comment": "The number and impact of pauses varied significantly depending on the question. Unintentional pauses can be disruptive, while strategically placed pauses enhance impact.", "count": 10}, "personalized_examples": [{"feedback": "Expand on your background with concrete examples. Instead of simply stating your position, describe specific projects or contributions that showcase your experience and skills.", "line": "I am an engineer at TechCorp"}, {"feedback": "Relate your skills directly to the job requirements. Provide evidence demonstrating how your skills and experiences align with the needs of the role.", "line": "I believe this role aligns with my skills"}, {"feedback": "Provide specific examples to substantiate your strengths, instead of simply listing them. Quantify your achievements.", "line": "My key strengths are problem-solving, team management, and adaptability."}], "speaking_rate": {"comment": "The speaking rate fluctuated considerably across the responses, sometimes being too fast, other times too slow. Consistent pacing is key for effective delivery.", "rate": 3}, "tone": "The tone varied from polite but lacking confidence to confident and professional. Maintaining a consistent confident tone throughout is vital for professional communication.", "sentence_structuring_and_grammar": "Basic grammar was mostly accurate, but sentence structure could be improved to be more varied and engaging. More complex and well-structured sentences would be beneficial."}, "overall_feedback": {"areas_of_improvement": "Reduce filler words, enhance sentence structure, maintain consistent speaking rate and confident tone, and provide specific examples to support claims.", "key_strengths": "Clear articulation in several responses, basic grammatical accuracy, ability to convey key information.", "summary": "The candidate demonstrates a baseline communication ability, but several significant areas require improvement for enhanced clarity and professionalism. Inconsistency across responses suggests a lack of consistent preparation and delivery."}}

graph_data = { 
  "tone": [3.2, 3.5, 3.0, 4.0, 3.8],
  "speaking_rate": [2.5, 3.0, 2.8, 3.2, 3.1],
  "filler_word_count": [4, 3, 5, 2, 6],
  "clarity": [4.0, 3.8, 4.2, 3.9, 4.1],
  "sentence_structuring": [3.4, 3.2, 2.9, 3.1, 2.1],
  "pause_count": [2, 3, 1, 4, 2],
  "articulation": [2.3, 4, 3, 4.1, 3.3],
  "enunciation": [1.7, 4, 3.9, 2.4, 4],
}

generate_feedback_report(test, graph_data, "assessment_report.pdf")
