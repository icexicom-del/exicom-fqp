// ── FQP Sheet & Task Definitions ─────────────────────────────────────────────
// Edit this file to add, remove, or rename inspection checkpoints.
// ─────────────────────────────────────────────────────────────────────────────

export const SHEETS = [
  { id: "s0", label: "Pre-Installation Survey", abbr: "PRE", color: "#0369a1", tasks: [
    { id: "PI-01", activity: "Site Accessibility & Entry Route",       method: "Physical Inspection",          acceptance: "Clear access path confirmed for equipment & vehicles" },
    { id: "PI-02", activity: "Land Ownership / NOC Verification",      method: "Document Check",               acceptance: "NOC / ownership docs available and valid" },
    { id: "PI-03", activity: "Existing Infrastructure Check",          method: "Visual Inspection",            acceptance: "Utilities mapped; no conflicts with charger placement" },
    { id: "PI-04", activity: "Power Availability Assessment",          method: "DISCOM check + Meter reading", acceptance: "Contracted load verified (min. per charger spec)" },
    { id: "PI-05", activity: "Civil Site Assessment",                  method: "Measurement + Level Check",    acceptance: "Level surface; min. area per charger footprint met" },
    { id: "PI-06", activity: "Communication Network Check",            method: "Signal Strength Test",         acceptance: "4G/5G RSSI ≥ −90 dBm at charger location" },
    { id: "PI-07", activity: "Safety Hazard Assessment",               method: "Risk Assessment + Photo",      acceptance: "No immediate hazard; signed risk log" },
    { id: "PI-08", activity: "Customer Sign-off on Survey Report",     method: "Document Sign-off",            acceptance: "Signed survey report received" },
  ]},
  { id: "s1", label: "Civil Works", abbr: "CIVIL", color: "#92400e", tasks: [
    { id: "CW-01", activity: "Demarcation & Layout Marking",           method: "Physical Survey",              acceptance: "Layout per approved GA drawing" },
    { id: "CW-02", activity: "Cable Trench Excavation",               method: "Measurement + Inspection",     acceptance: "Trench depth ≥ 600 mm; width per drawing" },
    { id: "CW-03", activity: "HDPE / PVC Conduit Laying",             method: "Visual Inspection",            acceptance: "No kinks; bends ≤ 45°; joints sealed" },
    { id: "CW-04", activity: "Cable Tray / Ladder Fixing",            method: "Visual + Torque Check",        acceptance: "Level ±5 mm/m; supports ≤ 1.5 m c/c; earthed" },
    { id: "CW-05", activity: "Charging Bay Flooring / Paving",        method: "Level Gauge + Visual",         acceptance: "Slope ≤ 1%; no ponding; non-slip finish" },
    { id: "CW-06", activity: "Canopy / Shade Structure Erection",      method: "Visual + Load Record",         acceptance: "As per structural drawings; FAT completed" },
    { id: "CW-07", activity: "Bollards & Wheel Stops",                method: "Visual Inspection",            acceptance: "Height ≥ 150 mm; retroreflective strips applied" },
    { id: "CW-08", activity: "Signage & EV Parking Markings",         method: "Visual Inspection",            acceptance: "Compliant with CMVR / State EV Policy" },
    { id: "CW-09", activity: "Backfilling & Compaction",              method: "Visual + Compaction Test",     acceptance: "Proctor density ≥ 90%; no settlements" },
    { id: "CW-10", activity: "Civil Works Handover Inspection",       method: "Site Walkthrough",             acceptance: "Contractor + Client sign-off sheet received" },
  ]},
  { id: "s2", label: "Electrical Works", abbr: "ELEC", color: "#6d28d9", tasks: [
    { id: "EW-01", activity: "Service Connection Verification (HT/LT)", method: "Document + Meter Check",       acceptance: "Approved DISCOM connection letter on file" },
    { id: "EW-02", activity: "Main Panel / APFC Installation",          method: "Visual + SLD Verification",    acceptance: "Per approved SLD; earthing completed" },
    { id: "EW-03", activity: "Power Cable Laying (Charger Feed)",        method: "Visual + Continuity Test",     acceptance: "Correct sizing per load schedule; no damage" },
    { id: "EW-04", activity: "Earthing & Lightning Protection",          method: "Earth Resistance Test (Megger)",acceptance: "Earth resistance ≤ 1 Ω" },
    { id: "EW-05", activity: "Surge Protection Device (SPD)",            method: "Visual + Datasheet Verify",    acceptance: "SPD rating matches charger surge spec" },
    { id: "EW-06", activity: "MCB / RCCB / MCCB Rating Check",          method: "Visual + Rating Verification", acceptance: "Correct ratings; properly labelled" },
    { id: "EW-07", activity: "Cable Ferrule & Termination",              method: "Visual + Torque Wrench Check", acceptance: "Correct ferrule colours; torque per spec" },
    { id: "EW-08", activity: "Control / Comm Cable Routing",             method: "Visual Inspection",            acceptance: "Separated from power cables by ≥ 150 mm; labelled" },
    { id: "EW-09", activity: "Insulation Resistance (IR) Test",          method: "Megger Test @ 500 V DC",       acceptance: "IR ≥ 1 MΩ (phase-phase and phase-earth)" },
  ]},
  { id: "s3", label: "Equipment Installation", abbr: "EQUIP", color: "#0e7490", tasks: [
    { id: "EI-01", activity: "EV Charger Unit Receipt Inspection",       method: "Visual + Document Check",      acceptance: "No transit damage; serial no. verified vs PO" },
    { id: "EI-02", activity: "Foundation / Plinth Check",                method: "Dimension Measurement",        acceptance: "Dimensions per charger anchor-bolt drawing ± 5 mm" },
    { id: "EI-03", activity: "Charger Mounting & Anchoring",             method: "Visual + Torque Wrench",       acceptance: "Plumb ± 2°; anchor bolts torqued to spec" },
    { id: "EI-04", activity: "Power Connection to Charger",              method: "Visual + Phase Sequence Test", acceptance: "Correct phase sequence (RYB); torque per terminal spec" },
    { id: "EI-05", activity: "CT / PT Metering Unit",                   method: "Visual + Wiring Diagram Check", acceptance: "Per DISCOM metering scheme; sealed" },
    { id: "EI-06", activity: "Network (Router / SIM) Setup",             method: "Connectivity Test",            acceptance: "Ping to CMS cloud server successful" },
    { id: "EI-07", activity: "Firmware Update & Configuration",          method: "System Dashboard Check",       acceptance: "Latest firmware flashed; config per site template" },
    { id: "EI-08", activity: "RFID / App Auth Integration",              method: "Functional Test",              acceptance: "Auth via RFID card and app successful" },
    { id: "EI-09", activity: "Cable Management & Holster Check",         method: "Visual Inspection",            acceptance: "Cables neatly dressed; holster locks/unlocks correctly" },
    { id: "EI-10", activity: "Safety Labels & Warning Stickers",         method: "Visual Inspection",            acceptance: "All IS / IEC mandatory labels present and legible" },
  ]},
  { id: "s4", label: "Testing & Commissioning", abbr: "T&C", color: "#047857", tasks: [
    { id: "TC-01", activity: "Power ON Test",                            method: "Functional Test + Observation", acceptance: "No trips on energisation; display shows READY" },
    { id: "TC-02", activity: "Input Voltage & Frequency Check",          method: "Clamp Meter / Power Analyser",  acceptance: "V: 230 V ± 10% (L-N); Freq: 50 Hz ± 1%" },
    { id: "TC-03", activity: "OCPP Connectivity Test",                   method: "OCPP Log Review (CMS)",         acceptance: "BootNotification + Heartbeat OK; charger ONLINE in CMS" },
    { id: "TC-04", activity: "AC Charging Functional Test",              method: "Live Charge with Test EV",      acceptance: "Charging initiated; kWh meter increments correctly" },
    { id: "TC-05", activity: "DC Charging Functional Test (if applicable)",method: "Live Charge with Test EV",   acceptance: "CCS2 / CHAdeMO handshake & charge verified" },
    { id: "TC-06", activity: "RCCB / RCD Trip Test",                     method: "RCD Test Instrument",          acceptance: "Trip time ≤ 300 ms at 30 mA test current" },
    { id: "TC-07", activity: "Ground Fault Detection Test",              method: "Simulated Ground Fault",       acceptance: "Charger de-energises within spec (< 2 s)" },
    { id: "TC-08", activity: "Billing & Metering Accuracy",              method: "kWh Meter Calibration vs Ref", acceptance: "Error ≤ ± 2% vs. reference energy meter" },
    { id: "TC-09", activity: "Remote CMS Monitoring Verification",       method: "CMS Dashboard Live View",      acceptance: "Real-time telemetry visible; alarms functional" },
    { id: "TC-10", activity: "Emergency Stop (E-Stop) Test",             method: "Functional Test",              acceptance: "E-stop isolates all power within 2 s" },
    { id: "TC-11", activity: "Full-Load Run Test",                       method: "Rated kW continuous run",      acceptance: "Output stable at rated kW; temp rise within spec" },
  ]},
  { id: "s5", label: "Site Handover", abbr: "HNDOVR", color: "#334155", tasks: [
    { id: "SH-01", activity: "Final Site Cleanliness Check",             method: "Visual Inspection",            acceptance: "Site clean; all construction debris removed" },
    { id: "SH-02", activity: "As-Built Drawing Submission",              method: "Document Check",               acceptance: "Stamped as-built drawings submitted to client" },
    { id: "SH-03", activity: "O&M Manual & Warranty Card",              method: "Document Handover",            acceptance: "Full set handed over; acknowledgement signed" },
    { id: "SH-04", activity: "Operator Training Session",               method: "Training + Attendance Sign-off", acceptance: "Min. 1 operator trained; training register signed" },
    { id: "SH-05", activity: "Customer Acceptance Test",                method: "Customer EV Charge Demo",      acceptance: "Customer successfully charges their EV" },
    { id: "SH-06", activity: "DISCOM Metering Seal",                    method: "Document Check",               acceptance: "DISCOM seal obtained; meter reading noted" },
    { id: "SH-07", activity: "Handover Certificate",                    method: "Document Sign-off",            acceptance: "Signed handover certificate issued to both parties" },
    { id: "SH-08", activity: "CMS Live Monitoring Confirmation",        method: "CMS Dashboard Final Check",    acceptance: "Site LIVE; last 24h telemetry normal" },
  ]},
];

export const STATUS = {
  pending:     { label: "Pending",      color: "#64748b", bg: "#f1f5f9",  dot: "○" },
  in_progress: { label: "In Progress",  color: "#d97706", bg: "#fef3c7",  dot: "◑" },
  completed:   { label: "Completed",    color: "#059669", bg: "#d1fae5",  dot: "●" },
  verified:    { label: "Verified",     color: "#7c3aed", bg: "#ede9fe",  dot: "✓" },
  na:          { label: "N/A",          color: "#94a3b8", bg: "#f8fafc",  dot: "—" },
  failed:      { label: "Failed / NCR", color: "#dc2626", bg: "#fee2e2",  dot: "✗" },
};

export function tKey(siteId, si, taskId) {
  return `${siteId}_${si}_${taskId}`;
}

export function sheetProg(siteId, si, taskData) {
  const tasks = SHEETS[si].tasks;
  let done = 0, failed = 0, inProg = 0, na = 0;
  for (const t of tasks) {
    const s = taskData[tKey(siteId, si, t.id)]?.status || "pending";
    if (s === "completed" || s === "verified") done++;
    else if (s === "failed") failed++;
    else if (s === "in_progress") inProg++;
    else if (s === "na") na++;
  }
  const eff = tasks.length - na;
  return { total: tasks.length, done, failed, inProg, na, pct: eff ? Math.round(done / eff * 100) : 0 };
}

export function siteProg(siteId, taskData) {
  let done = 0, total = 0, failed = 0;
  for (let i = 0; i < SHEETS.length; i++) {
    const p = sheetProg(siteId, i, taskData);
    done += p.done; total += p.total - p.na; failed += p.failed;
  }
  return { pct: total ? Math.round(done / total * 100) : 0, failed };
}
