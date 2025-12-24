#!/usr/bin/env node
/**
 * Digestive Pipeline for Roads to AGI
 * 
 * Processes raw artifacts and extracts operational claims.
 * Run: node scripts/digest.js [artifact_id]
 * 
 * If no artifact_id provided, processes all pending artifacts.
 */

const API_BASE = 'https://r2agi-api.moritzbierling.workers.dev';

async function fetchArtifacts() {
  const res = await fetch(`${API_BASE}/artifacts`);
  const data = await res.json();
  return data.artifacts.filter(a => a.status === 'pending');
}

async function fetchArtifact(id) {
  const res = await fetch(`${API_BASE}/artifact/${id}`);
  return res.json();
}

function generateClaimPrompt(artifact) {
  return `You are processing raw material for the Roads to AGI project.

ARTIFACT:
Type: ${artifact.kind}
Source: ${artifact.source_url || 'N/A'}
Tags: ${(artifact.tags || []).join(', ') || 'none'}
Note: ${artifact.note || 'none'}

CONTENT:
${artifact.content}

---

Extract operational claims from this content. Each claim must be:
1. Atomic - one testable assertion
2. Operational - constructible, with clear pre/post conditions
3. Falsifiable - can be tested or challenged

For each claim, output YAML in this format:

\`\`\`yaml
id: C-XXXX  # Will be assigned
version: "1.0.0"
text: "The claim in operational language"
dependencies: []  # Other claim IDs this depends on
evidence: ["artifact:${artifact.id}"]
gates: []  # Gate IDs for testing this claim
status: proposed
changelog:
  - "1.0.0: Extracted from ${artifact.kind}"
\`\`\`

Extract 1-5 claims. Focus on quality over quantity. If the content doesn't contain clear operational claims, output NONE.`;
}

function generateGatePrompt(claim) {
  return `Design gates (tests) for this claim:

CLAIM: ${claim.text}

Create 2-3 gates. Each gate should be one of:
- operationalization: Can the claim be reduced to constructible steps?
- prediction: Does the claim make testable predictions?
- cost-accounting: What are the costs/externalities?
- warranty: What guarantees does the claim make?
- liability: What happens if the claim fails?

Output YAML:

\`\`\`yaml
id: T-XXXX  # Will be assigned
version: "1.0.0"
kind: "operationalization|prediction|cost-accounting|warranty|liability"
prompt: "The test question"
pass_if:
  - "Criterion 1"
  - "Criterion 2"
\`\`\``;
}

async function processArtifact(artifact) {
  console.log(`\n📦 Processing artifact: ${artifact.id}`);
  console.log(`   Type: ${artifact.kind}`);
  console.log(`   Content length: ${artifact.content.length} chars`);
  
  const prompt = generateClaimPrompt(artifact);
  
  console.log('\n📝 Generated prompt for claim extraction:');
  console.log('─'.repeat(60));
  console.log(prompt.slice(0, 500) + '...');
  console.log('─'.repeat(60));
  
  console.log('\n💡 To process with an LLM:');
  console.log('   1. Copy the prompt above');
  console.log('   2. Send to Claude/GPT');
  console.log('   3. Save output claims to data/claims/');
  console.log('   4. Update artifact status to "processed"');
  
  return { artifact, prompt };
}

async function main() {
  const targetId = process.argv[2];
  
  if (targetId) {
    const artifact = await fetchArtifact(targetId);
    if (artifact.error) {
      console.error(`Error: ${artifact.error}`);
      process.exit(1);
    }
    await processArtifact(artifact);
  } else {
    console.log('🔍 Fetching pending artifacts...');
    const pending = await fetchArtifacts();
    
    if (pending.length === 0) {
      console.log('✓ No pending artifacts to process');
      return;
    }
    
    console.log(`Found ${pending.length} pending artifact(s)`);
    
    for (const artifact of pending) {
      await processArtifact(artifact);
    }
  }
}

main().catch(console.error);
