// Utility functions
function classifyDocument(prompt) {
  for (const [type, pattern] of Object.entries(documentPatterns)) {
    if (pattern.test(prompt)) {
      return type;
    }
  }
  return 'general';
}


function detectIndustry(prompt) {
  for (const [industry, pattern] of Object.entries(industryPatterns)) {
    if (pattern.test(prompt)) {
      return industry;
    }
  }
  return 'general';
}

function extractContext(prompt) {
  const context = {};
  
  // Extract duration
  const durationMatch = prompt.match(/(\d+)\s*(month|year|week|day)s?/i);
  if (durationMatch) {
    context.duration = `${durationMatch[1]} ${durationMatch[2]}${durationMatch[1] > 1 ? 's' : ''}`;
  }
  
  // Extract payment terms
  if (/hourly/i.test(prompt)) context.payment = 'hourly';
  if (/monthly/i.test(prompt)) context.payment = 'monthly';
  if (/milestone/i.test(prompt)) context.payment = 'milestone';
  if (/fixed/i.test(prompt)) context.payment = 'fixed';
  
  return context;
}

export {
  classifyDocument,
  detectIndustry,
  extractContext
}