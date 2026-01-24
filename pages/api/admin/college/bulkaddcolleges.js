// pages/api/admin/college/bulkaddcolleges.js
import connectToMongo from '@/middleware/middleware';
import College from '@/models/College';

/**
 * Extracts the shorter institution name from the full name
 * Handles cases like:
 * - "Indian Institute of Technology Bombay (IIT Bombay)" -> "IIT Bombay"
 * - "VIT (Vellore Institute of Technology)" -> "VIT"
 * - "National Institute of Technology Warangal" -> "National Institute of Technology Warangal"
 */
function extractInstitutionName(fullName) {
  // Remove surrounding quotes
  let name = fullName.trim().replace(/^["']|["']$/g, '');
  
  // Check if there's content in parentheses
  const parenMatch = name.match(/\(([^)]+)\)/) ;
  
  if (parenMatch) {
    const insideParens = parenMatch[1].trim();
    const outsideParens = name.replace(/\([^)]+\)/g, '').trim();
    
    // Return the shorter one (by character count)
    if (insideParens.length < outsideParens.length) {
      return insideParens;
    } else {
      return outsideParens;
    }
  }
  
  return name;
}

/**
 * Normalizes email domain to ensure consistency
 * Accepts: "@hbtu.ac.in" or "hbtu.ac.in"
 * Returns: "hbtu.ac.in" (without @)
 */
function normalizeEmailDomain(domain) {
  // Remove surrounding quotes and whitespace
  let normalized = domain.trim().replace(/^["']|["']$/g, '').trim();
  
  // Remove @ prefix if present
  if (normalized.startsWith('@')) {
    normalized = normalized.substring(1);
  }
  
  return normalized.toLowerCase();
}

/**
 * Validates email domain format using regex
 * Returns true if valid domain pattern
 */
function validateEmailDomain(domain) {
  // Domain should have at least one dot and valid characters
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Parses CSV text into college entries
 * Handles multiple domains separated by " / "
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const entries = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines or header
    if (!line || line.toLowerCase().startsWith('institution name')) {
      continue;
    }
    
    // Split by comma, but be careful with quoted strings
    const parts = line.match(/(?:"[^"]*"|[^,])+/g);
    
    if (!parts || parts.length < 2) {
      continue;
    }
    
    const institutionName = extractInstitutionName(parts[0]);
    const domainsRaw = parts[1];
    
    // Handle multiple domains separated by " / "
    const domainsList = domainsRaw.split('/').map(d => d.trim());
    
    for (const domainRaw of domainsList) {
      const domain = normalizeEmailDomain(domainRaw);
      
      if (domain && validateEmailDomain(domain)) {
        entries.push({
          college: institutionName,
          emailendswith: domain
        });
      }
    }
  }
  
  return entries;
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { csvText } = req.body;
    
    if (!csvText) {
      return res.status(400).json({ message: 'CSV text is required' });
    }
    
    // Parse CSV
    const entries = parseCSV(csvText);
    
    if (entries.length === 0) {
      return res.status(400).json({ message: 'No valid entries found in CSV' });
    }
    
    // Limit to 500 entries
    if (entries.length > 500) {
      return res.status(400).json({ 
        message: `Too many entries. Maximum 500 allowed, got ${entries.length}` 
      });
    }
    
    // Process entries and track results
    const results = {
      added: [],
      skipped: [],
      errors: []
    };
    
    for (const entry of entries) {
      try {
        // Check if college with this domain already exists
        const existing = await College.findOne({ 
          college: entry.college,
          emailendswith: entry.emailendswith 
        });
        
        if (existing) {
          results.skipped.push({
            college: entry.college,
            domain: entry.emailendswith,
            reason: 'Already exists'
          });
          continue;
        }
        
        // Create new college entry
        const newCollege = new College(entry);
        await newCollege.save();
        
        results.added.push({
          college: entry.college,
          domain: entry.emailendswith
        });
      } catch (error) {
        results.errors.push({
          college: entry.college,
          domain: entry.emailendswith,
          error: error.message
        });
      }
    }
    
    return res.status(200).json({
      message: 'Bulk add completed',
      summary: {
        total: entries.length,
        added: results.added.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (error) {
    console.error('Bulk add error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default connectToMongo(handler);
