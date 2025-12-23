import fs from "fs";
import path from "path";
import YAML from "yaml";

const DATA_DIR = path.resolve(process.cwd(), "../data");

export function loadYamlDir(subdir) {
  const dir = path.join(DATA_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map(f => YAML.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .filter(Boolean);
}

export function loadRoads() { return loadYamlDir("roads"); }
export function loadClaims() { return loadYamlDir("claims"); }
export function loadGates() { return loadYamlDir("gates"); }
export function loadChallenges() { return loadYamlDir("challenges"); }
export function loadExamples() { return loadYamlDir("examples"); }

export function getClaimById(claims, id) {
  return claims.find(c => c.id === id);
}

export function getGateById(gates, id) {
  return gates.find(g => g.id === id);
}

export function getRoadById(roads, id) {
  return roads.find(r => r.id === id);
}
