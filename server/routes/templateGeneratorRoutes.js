import express from "express";

const router = express.Router();

// Document classification patterns
const documentPatterns = {
  contract: /contract|agreement|engage/i,
  nda: /nda|non-disclosure|confidential/i,
  policy: /policy|guidelines|rules/i,
  documentation: /api|documentation|guide|manual/i,
  legal: /terms|privacy|license|waiver/i,
  hr: /employee|handbook|job|hiring/i
};

const industryPatterns = {
  technology: /software|api|app|development|tech|coding/i,
  marketing: /marketing|social media|advertising|seo|campaign/i,
  consulting: /consulting|advisory|strategy|guidance/i,
  creative: /design|logo|creative|graphic|branding/i,
  healthcare: /medical|healthcare|patient|clinic|doctor/i,
  finance: /financial|accounting|tax|investment|banking/i
};

// Question templates based on document type and context
const questionTemplates = {
  duration: {
    condition: (type) => ['contract', 'nda'].includes(type),
    question: "How long should this engagement last?",
    options: ["One-time project", "3 months", "6 months", "1 year", "Ongoing", "Custom"],
    format: "buttons"
  },
  payment: {
    condition: (type) => ['contract'].includes(type),
    question: "How will payment be structured?",
    options: ["Fixed fee", "Hourly rate", "Monthly retainer", "Milestone-based"],
    format: "buttons"
  },
  deliverables: {
    condition: (type, industry) => type === 'contract' && industry,
    question: "What should be included?",
    options: {
      technology: ["Source code", "Documentation", "Testing", "Deployment support"],
      marketing: ["Strategy", "Content creation", "Analytics", "Ad management"],
      consulting: ["Analysis", "Recommendations", "Implementation guide", "Training"],
      creative: ["Concepts", "Final designs", "Source files", "Brand guidelines"],
      default: ["Main deliverable", "Documentation", "Support", "Training"]
    },
    format: "checkboxes"
  },
  complexity: {
    condition: () => true,
    question: "What level of detail do you need?",
    options: ["Simple", "Standard", "Comprehensive"],
    format: "buttons"
  },
  jurisdiction: {
    condition: (type) => ['contract', 'nda', 'legal'].includes(type),
    question: "Legal jurisdiction?",
    options: ["Generic", "United States", "United Kingdom", "Canada", "Australia"],
    format: "dropdown"
  }
};


// Template content library
const templates = {
  contract: {
    simple: `# SERVICE AGREEMENT

**Date:** [DATE]
**Client:** [CLIENT_NAME]
**Service Provider:** [PROVIDER_NAME]

## Services
[SERVICE_DESCRIPTION]

## Timeline
**Start Date:** [START_DATE]
**Duration:** [DURATION]

## Payment
**Total Amount:** $[AMOUNT]
**Payment Terms:** [PAYMENT_TERMS]

## Signatures
Client: _________________ Date: _______
Provider: _________________ Date: _______`,

    standard: `# PROFESSIONAL SERVICE AGREEMENT

**Agreement Date:** [DATE]
**Client Company:** [CLIENT_COMPANY]
**Service Provider:** [PROVIDER_NAME]

## 1. SCOPE OF WORK
[DETAILED_SCOPE]

## 2. TIMELINE AND DELIVERABLES
**Project Duration:** [DURATION]
**Key Deliverables:**
[DELIVERABLES_LIST]

## 3. COMPENSATION
**Total Project Fee:** $[TOTAL_AMOUNT]
**Payment Structure:** [PAYMENT_STRUCTURE]
**Payment Terms:** Net [PAYMENT_DAYS] days

## 4. RESPONSIBILITIES
**Client Responsibilities:**
- Provide necessary information and materials
- Timely feedback on deliverables
- Payment according to agreed terms

**Provider Responsibilities:**
- Deliver quality work on schedule
- Maintain professional standards
- Communicate progress regularly

## 5. INTELLECTUAL PROPERTY
[IP_TERMS]

## 6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

## 7. TERMINATION
Either party may terminate with [TERMINATION_NOTICE] written notice.

## 8. SIGNATURES
**Client:**
Name: [CLIENT_NAME]
Signature: _________________ Date: _______

**Provider:**
Name: [PROVIDER_NAME]  
Signature: _________________ Date: _______`,

    comprehensive: `# COMPREHENSIVE SERVICE AGREEMENT

**Agreement Date:** [DATE]
**Effective Date:** [EFFECTIVE_DATE]

**CLIENT:**
[CLIENT_COMPANY_NAME]
[CLIENT_ADDRESS]
[CLIENT_CONTACT_INFO]

**SERVICE PROVIDER:**
[PROVIDER_COMPANY_NAME]
[PROVIDER_ADDRESS]
[PROVIDER_CONTACT_INFO]

## 1. SCOPE OF SERVICES
**Project Description:** [PROJECT_DESCRIPTION]
**Specific Services Include:**
[DETAILED_SERVICES_LIST]

## 2. PROJECT TIMELINE AND MILESTONES
**Project Duration:** [DURATION]
**Start Date:** [START_DATE]
**Completion Date:** [END_DATE]

**Milestone Schedule:**
| Milestone | Description | Due Date | Payment |
|-----------|-------------|----------|---------|
[MILESTONE_TABLE]

## 3. COMPENSATION AND PAYMENT TERMS
**Total Project Value:** $[TOTAL_AMOUNT]
**Payment Structure:** [PAYMENT_STRUCTURE]
**Payment Schedule:** [PAYMENT_SCHEDULE]
**Late Payment:** [LATE_PAYMENT_TERMS]

## 4. DELIVERABLES AND ACCEPTANCE
**Expected Deliverables:**
[DELIVERABLES_DETAILED]

**Acceptance Criteria:** [ACCEPTANCE_TERMS]

## 5. CLIENT OBLIGATIONS
[CLIENT_RESPONSIBILITIES_DETAILED]

## 6. INTELLECTUAL PROPERTY RIGHTS
[COMPREHENSIVE_IP_TERMS]

## 7. CONFIDENTIALITY AND NON-DISCLOSURE
[DETAILED_CONFIDENTIALITY_TERMS]

## 8. WARRANTIES AND LIABILITY
[WARRANTY_TERMS]
**Limitation of Liability:** [LIABILITY_LIMITS]

## 9. TERMINATION
**Termination for Convenience:** [TERMINATION_TERMS]
**Termination for Cause:** [CAUSE_TERMINATION]

## 10. GENERAL PROVISIONS
**Governing Law:** [JURISDICTION]
**Dispute Resolution:** [DISPUTE_RESOLUTION]
**Force Majeure:** [FORCE_MAJEURE_TERMS]
**Entire Agreement:** [ENTIRE_AGREEMENT_CLAUSE]

## SIGNATURES
**CLIENT:**
Print Name: [CLIENT_NAME]
Title: [CLIENT_TITLE]
Signature: _________________ Date: _______

**SERVICE PROVIDER:**
Print Name: [PROVIDER_NAME]
Title: [PROVIDER_TITLE]  
Signature: _________________ Date: _______`
  },

  nda: {
    simple: `# NON-DISCLOSURE AGREEMENT

**Date:** [DATE]
**Parties:** [PARTY_1] and [PARTY_2]

## Purpose
Protection of confidential information shared between parties.

## Confidential Information
[INFORMATION_TYPE]

## Obligations
- Keep information confidential
- Use only for intended purpose
- Return materials upon request

## Duration
This agreement remains in effect for [DURATION].

## Signatures
Party 1: _________________ Date: _______
Party 2: _________________ Date: _______`,

    standard: `# MUTUAL NON-DISCLOSURE AGREEMENT

**Effective Date:** [DATE]
**Party A:** [PARTY_A_NAME]
**Party B:** [PARTY_B_NAME]

## 1. PURPOSE
[NDA_PURPOSE]

## 2. DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes: [CONFIDENTIAL_INFO_DEFINITION]

## 3. OBLIGATIONS
Each party agrees to:
- Maintain strict confidentiality
- Use information only for stated purpose
- Protect information with reasonable care
- Not disclose to third parties

## 4. EXCEPTIONS
This agreement does not apply to information that:
- Is publicly known
- Is independently developed
- Is rightfully received from third parties

## 5. TERM
This agreement shall remain in effect for [DURATION] years.

## 6. RETURN OF MATERIALS
Upon termination, all materials shall be returned or destroyed.

## 7. GOVERNING LAW
This agreement is governed by [JURISDICTION] law.

## SIGNATURES
**Party A:**
Name: [PARTY_A_NAME]
Signature: _________________ Date: _______

**Party B:**
Name: [PARTY_B_NAME]
Signature: _________________ Date: _______`
  },

  policy: {
    simple: `# [POLICY_TITLE]

**Effective Date:** [DATE]
**Applies To:** [AUDIENCE]

## Purpose
[POLICY_PURPOSE]

## Policy
[POLICY_CONTENT]

## Responsibilities
[RESPONSIBILITIES]

## Enforcement
[ENFORCEMENT_TERMS]`,

    standard: `# [POLICY_TITLE]

**Document Version:** 1.0
**Effective Date:** [EFFECTIVE_DATE]
**Review Date:** [REVIEW_DATE]
**Approved By:** [APPROVER]

## 1. PURPOSE AND SCOPE
**Purpose:** [POLICY_PURPOSE]
**Scope:** [POLICY_SCOPE]
**Applies To:** [TARGET_AUDIENCE]

## 2. POLICY STATEMENT
[DETAILED_POLICY_STATEMENT]

## 3. DEFINITIONS
[KEY_DEFINITIONS]

## 4. RESPONSIBILITIES
[ROLE_RESPONSIBILITIES]

## 5. PROCEDURES
[STEP_BY_STEP_PROCEDURES]

## 6. COMPLIANCE AND MONITORING
[COMPLIANCE_REQUIREMENTS]

## 7. VIOLATIONS AND ENFORCEMENT
[ENFORCEMENT_PROCEDURES]

## 8. RELATED DOCUMENTS
[RELATED_POLICIES_REFERENCES]

## 9. REVIEW AND UPDATES
This policy will be reviewed annually and updated as needed.`
  }
};

// Analyze prompt and return dynamic questions
app.post('/analyze', (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const documentType = classifyDocument(prompt);
    const industry = detectIndustry(prompt);
    const context = extractContext(prompt);
    
    // Generate applicable questions
    const questions = [];
    
    Object.entries(questionTemplates).forEach(([key, template]) => {
      // Check if question should be included
      let shouldInclude = false;
      
      if (key === 'complexity') {
        shouldInclude = true; // Always include complexity
      } else if (key === 'deliverables' && template.condition(documentType, industry)) {
        shouldInclude = true;
      } else if (template.condition && template.condition(documentType)) {
        shouldInclude = true;
      }
      
      // Skip if context already provided
      if (shouldInclude && !context[key]) {
        const question = { ...template, id: key };
        
        // Customize options based on industry
        if (key === 'deliverables' && question.options[industry]) {
          question.options = question.options[industry];
        } else if (key === 'deliverables' && typeof question.options === 'object') {
          question.options = question.options.default;
        }
        
        questions.push(question);
      }
    });
    
    res.json({
      documentType,
      industry,
      autoDetected: context,
      questions: questions.slice(0, 4) // Limit to 4 questions max
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Generate document template
app.post('/generate', (req, res) => {
  try {
    const { prompt, answers = {}, complexity = 'standard' } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const documentType = classifyDocument(prompt);
    const industry = detectIndustry(prompt);
    
    // Get base template
    const templateCategory = templates[documentType] || templates.contract;
    const template = templateCategory[complexity] || templateCategory.standard;
    
    // Create filled template with placeholders and answers
    let filledTemplate = template;
    
    // Replace with provided answers
    Object.entries(answers).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase()}]`;
      if (Array.isArray(value)) {
        filledTemplate = filledTemplate.replace(placeholder, value.map(v => `- ${v}`).join('\n'));
      } else {
        filledTemplate = filledTemplate.replace(placeholder, value);
      }
    });
    
    // Add context from prompt
    filledTemplate = filledTemplate.replace('[SERVICE_DESCRIPTION]', prompt);
    filledTemplate = filledTemplate.replace('[PROJECT_DESCRIPTION]', prompt);
    filledTemplate = filledTemplate.replace('[POLICY_PURPOSE]', prompt);
    
    res.json({
      template: filledTemplate,
      documentType,
      industry,
      complexity,
      metadata: {
        wordCount: filledTemplate.split(' ').length,
        sections: (filledTemplate.match(/##/g) || []).length,
        placeholders: (filledTemplate.match(/\[.*?\]/g) || []).length
      }
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;