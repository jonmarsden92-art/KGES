// ============================================================
// seedFirestore.js
// Run ONCE to populate Firestore with sample data.
// node seedFirestore.js
//
// Requires: npm install firebase-admin
// Download your service account key from:
// Firebase Console → Project Settings → Service Accounts
// → Generate new private key → save as serviceAccountKey.json
// ============================================================

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ============================================================
// Sample Engineers
// ============================================================
const ENGINEERS = [
  { name: "James Thornton", role: "Senior Electrical Engineer", phone: "07700 900001", email: "j.thornton@company.com", available: true, active: true, skills: ["Electrical", "Data/Networks", "Working at Height", "First Aid"], certExpiry: "2026-06-15", color: "#2563eb" },
  { name: "Sarah Mitchell", role: "Mechanical Engineer", phone: "07700 900002", email: "s.mitchell@company.com", available: true, active: true, skills: ["Mechanical", "HVAC", "Welding", "Confined Space"], certExpiry: "2025-12-01", color: "#16a34a" },
  { name: "Daniel Hayes", role: "Gas Engineer", phone: "07700 900003", email: "d.hayes@company.com", available: false, active: true, skills: ["Gas", "Plumbing", "Fire Safety", "First Aid"], certExpiry: "2026-03-20", color: "#dc2626" },
  { name: "Priya Sharma", role: "Multi-Skilled Engineer", phone: "07700 900004", email: "p.sharma@company.com", available: true, active: true, skills: ["Electrical", "Mechanical", "HVAC", "Building Control"], certExpiry: "2026-09-10", color: "#9333ea" },
  { name: "Chris Walton", role: "Plumbing & Heating Eng.", phone: "07700 900005", email: "c.walton@company.com", available: true, active: true, skills: ["Plumbing", "Gas", "HVAC", "Asbestos Awareness"], certExpiry: "2026-01-30", color: "#ea580c" },
  { name: "Emma Clarke", role: "Fire & Safety Engineer", phone: "07700 900006", email: "e.clarke@company.com", available: true, active: true, skills: ["Fire Safety", "Electrical", "Working at Height", "First Aid"], certExpiry: "2026-07-22", color: "#0891b2" },
  { name: "Ryan O'Brien", role: "Solar & Renewables Eng.", phone: "07700 900007", email: "r.obrien@company.com", available: false, active: true, skills: ["Solar/Renewables", "Electrical", "Working at Height", "Building Control"], certExpiry: "2025-11-15", color: "#ca8a04" },
  { name: "Laura Bennett", role: "HVAC Specialist", phone: "07700 900008", email: "l.bennett@company.com", available: true, active: true, skills: ["HVAC", "Mechanical", "Gas", "Asbestos Awareness"], certExpiry: "2026-05-08", color: "#be185d" },
  { name: "Tom Fletcher", role: "Data & Networks Eng.", phone: "07700 900009", email: "t.fletcher@company.com", available: true, active: true, skills: ["Data/Networks", "Electrical", "Building Control", "First Aid"], certExpiry: "2026-04-14", color: "#0d9488" },
  { name: "Aisha Patel", role: "Building Services Eng.", phone: "07700 900010", email: "a.patel@company.com", available: true, active: true, skills: ["Building Control", "HVAC", "Fire Safety", "Electrical"], certExpiry: "2026-08-03", color: "#7c3aed" },
  { name: "Mark Sullivan", role: "Welding & Fabrication", phone: "07700 900011", email: "m.sullivan@company.com", available: true, active: true, skills: ["Welding", "Mechanical", "Confined Space", "Working at Height"], certExpiry: "2026-02-27", color: "#b45309" },
  { name: "Charlotte Reed", role: "Electrical Inspector", phone: "07700 900012", email: "c.reed@company.com", available: false, active: true, skills: ["Electrical", "Building Control", "Fire Safety", "Asbestos Awareness"], certExpiry: "2026-10-19", color: "#4f46e5" },
  { name: "Nathan Cross", role: "Gas Safe Engineer", phone: "07700 900013", email: "n.cross@company.com", available: true, active: true, skills: ["Gas", "Plumbing", "HVAC", "First Aid"], certExpiry: "2025-09-30", color: "#dc2626" },
  { name: "Fiona Gallagher", role: "Project Engineer", phone: "07700 900014", email: "f.gallagher@company.com", available: true, active: true, skills: ["Building Control", "Mechanical", "Fire Safety", "Working at Height"], certExpiry: "2026-11-05", color: "#059669" },
  { name: "Jake Morrison", role: "Renewables Specialist", phone: "07700 900015", email: "j.morrison@company.com", available: true, active: true, skills: ["Solar/Renewables", "Electrical", "Data/Networks", "Asbestos Awareness"], certExpiry: "2026-06-30", color: "#0284c7" },
  { name: "Helen Ward", role: "H&S Engineer", phone: "07700 900016", email: "h.ward@company.com", available: true, active: true, skills: ["First Aid", "Fire Safety", "Asbestos Awareness", "Working at Height"], certExpiry: "2027-01-10", color: "#db2777" },
  { name: "Omar Hassan", role: "Mechanical Fitter", phone: "07700 900017", email: "o.hassan@company.com", available: false, active: true, skills: ["Mechanical", "Welding", "Confined Space", "Plumbing"], certExpiry: "2026-03-15", color: "#65a30d" },
  { name: "Sophie Turner", role: "Electrical Engineer", phone: "07700 900018", email: "s.turner@company.com", available: true, active: true, skills: ["Electrical", "Solar/Renewables", "HVAC", "First Aid"], certExpiry: "2026-12-22", color: "#7c3aed" },
  { name: "Ben Howells", role: "Plumbing Engineer", phone: "07700 900019", email: "b.howells@company.com", available: true, active: true, skills: ["Plumbing", "Gas", "Fire Safety", "Asbestos Awareness"], certExpiry: "2026-05-18", color: "#c2410c" },
  { name: "Niamh Kelly", role: "Multi-Discipline Eng.", phone: "07700 900020", email: "n.kelly@company.com", available: true, active: true, skills: ["Electrical", "Mechanical", "Gas", "Building Control"], certExpiry: "2026-07-07", color: "#0891b2" },
];

// ============================================================
// Sample Jobs  (assignedEngineers will be filled by index after
// engineers are written, so IDs are stable)
// ============================================================
const JOBS_TEMPLATE = [
  { title: "Commercial HVAC Overhaul", client: "Tesco Distribution Centre", site: "Bristol BS3", date: "2026-03-23", endDate: "2026-03-25", requiredSkills: ["HVAC", "Mechanical"], engineerIndexes: [1, 7], status: "confirmed", priority: "high", archived: false },
  { title: "Electrical Installation", client: "Premier Inn", site: "Manchester M1", date: "2026-03-23", endDate: "2026-03-23", requiredSkills: ["Electrical", "Working at Height"], engineerIndexes: [0, 5], status: "confirmed", priority: "medium", archived: false },
  { title: "Gas Boiler Service x8", client: "NHS Trust", site: "Leeds LS1", date: "2026-03-24", endDate: "2026-03-24", requiredSkills: ["Gas", "Plumbing"], engineerIndexes: [4, 12], status: "confirmed", priority: "high", archived: false },
  { title: "Solar Panel Install", client: "Warwick University", site: "Coventry CV4", date: "2026-03-25", endDate: "2026-03-26", requiredSkills: ["Solar/Renewables", "Electrical"], engineerIndexes: [6, 14], status: "provisional", priority: "medium", archived: false },
  { title: "Fire Alarm Systems", client: "JLL Properties", site: "Birmingham B1", date: "2026-03-26", endDate: "2026-03-26", requiredSkills: ["Fire Safety", "Electrical"], engineerIndexes: [5, 11], status: "confirmed", priority: "high", archived: false },
  { title: "Data Centre Cabling", client: "Vodafone UK", site: "Newbury RG14", date: "2026-03-27", endDate: "2026-03-27", requiredSkills: ["Data/Networks", "Electrical"], engineerIndexes: [8, 17], status: "confirmed", priority: "medium", archived: false },
  { title: "Confined Space Welding", client: "Thames Water", site: "Reading RG1", date: "2026-03-30", endDate: "2026-03-31", requiredSkills: ["Welding", "Confined Space"], engineerIndexes: [10, 16], status: "provisional", priority: "high", archived: false },
  { title: "M&E Building Inspection", client: "Savills", site: "London EC2", date: "2026-03-30", endDate: "2026-03-30", requiredSkills: ["Building Control", "Mechanical", "Electrical"], engineerIndexes: [3, 13, 19], status: "confirmed", priority: "medium", archived: false },
];

async function seed() {
  console.log("Seeding engineers...");
  const engineerIds = [];

  for (const eng of ENGINEERS) {
    const ref = await db.collection("engineers").add({
      ...eng,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    engineerIds.push(ref.id);
    console.log(`  ✓ ${eng.name} → ${ref.id}`);
  }

  console.log("\nSeeding jobs...");
  for (const job of JOBS_TEMPLATE) {
    const { engineerIndexes, ...jobData } = job;
    await db.collection("jobs").add({
      ...jobData,
      assignedEngineers: engineerIndexes.map((i) => engineerIds[i]),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${job.title}`);
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
