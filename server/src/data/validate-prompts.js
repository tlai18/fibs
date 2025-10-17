// Simple script to validate prompts.json
const fs = require('fs');
const path = require('path');

const promptsPath = path.join(__dirname, 'prompts.json');

try {
  const promptsData = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
  
  console.log('✅ JSON is valid');
  console.log(`📊 Total prompts: ${promptsData.length}`);
  
  // Validate structure
  const requiredFields = ['textTrue', 'textDecoy'];
  let isValid = true;
  
  promptsData.forEach((prompt, index) => {
    requiredFields.forEach(field => {
      if (!prompt.hasOwnProperty(field)) {
        console.error(`❌ Prompt ${index} missing field: ${field}`);
        isValid = false;
      }
    });
    
    if (typeof prompt.textTrue !== 'string' || typeof prompt.textDecoy !== 'string') {
      console.error(`❌ Prompt ${index} has invalid text fields (must be strings)`);
      isValid = false;
    }
  });
  
  if (isValid) {
    console.log('✅ All prompts have valid structure');
    
    // Show simple statistics
    console.log(`📊 Total prompts: ${promptsData.length}`);
    console.log(`✅ All prompts contain textTrue and textDecoy fields`);
  }
  
} catch (error) {
  console.error('❌ Error reading/parsing prompts.json:', error.message);
  process.exit(1);
}
