function formatEmailText(text) {
  // Split into sections based on common email patterns
  const sections = text.trim().split('\n\n');
  
  const formattedSections = sections.map(section => {
    const trimmedSection = section.trim();
    
    // Handle greeting (usually short, ends with comma or colon)
    if (trimmedSection.match(/^(Dear|Hello|Hi|Good morning|Good afternoon)/i)) {
      return trimmedSection + '\n';
    }
    
    // Handle signature/closing (usually starts with regards, sincerely, etc.)
    if (trimmedSection.match(/^(Best regards|Sincerely|Kind regards|Thank you|Best)/i)) {
      return '\n' + trimmedSection;
    }
    
    // Regular paragraph - ensure proper spacing
    return trimmedSection;
  });
  
  return formattedSections
    .filter(section => section.trim().length > 0)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n'); // Prevent too many line breaks
}

export default formatEmailText;