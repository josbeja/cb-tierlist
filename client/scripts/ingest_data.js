import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, 'data.csv');
const OUTPUT_PATH = path.join(__dirname, '../src/data/tierlist.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const TIER_MAPPING = {
  '*': 'Situational',
  'S': 'S Tier',
  'A': 'A Tier',
  'B': 'B Tier',
  'C': 'C Tier',
  'D': 'D Tier',
  'E': 'E Tier',
  'F': 'F Tier'
};

const TIER_DESCRIPTIONS = {
  '*': 'SITUATIONAL',
  'S': 'OVERPOWERED',
  'A': 'META',
  'B': 'GREAT',
  'C': 'DECENT',
  'D': 'UNDER POWERED',
  'E': 'BAD OPTION',
  'F': 'WORST'
};

try {
  const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
  
  Papa.parse(fileContent, {
    complete: (results) => {
      const data = [];
      
      results.data.forEach(row => {
        // Row is an array of values
        if (!row || row.length === 0) return;
        
        const tierKey = row[0]?.trim();
        
        if (TIER_MAPPING[tierKey]) {
          // It's a tier row
          // Collect units from column 1 onwards
          const units = row.slice(1)
            .map(cell => cell.trim())
            .filter(cell => cell !== '' && !cell.startsWith('http')); // Filter empty and URLs if any leak in
            
          // Check if we already have this tier (duplicates in CSV?)
          const existingTier = data.find(t => t.id === tierKey);
          
          if (existingTier) {
            existingTier.units.push(...units);
          } else {
            data.push({
              id: tierKey,
              name: TIER_MAPPING[tierKey],
              description: TIER_DESCRIPTIONS[tierKey] || '',
              units: units
            });
          }
        }
      });
      
      console.log(`Parsed ${data.length} tiers.`);
      data.forEach(t => console.log(`${t.id}: ${t.units.length} units`));
      
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
      console.log(`Wrote data to ${OUTPUT_PATH}`);
    }
  });
  
} catch (error) {
  console.error("Error processing data:", error);
  process.exit(1);
}
