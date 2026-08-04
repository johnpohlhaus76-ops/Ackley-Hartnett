// Machine Resources Configuration - Google Drive PDFs & Videos
// Folder: https://drive.google.com/drive/folders/1Tro43bEyvh0ZMpZQuHlkTAVO2UqRiD31

export const MACHINE_RESOURCES = {
  "vip5s": {
    name: "VIP 5S Laser Drill",
    description: "High-speed laser drilling system with vision inspection",
    pdfFolder: "1Tro43bEyvh0ZMpZQuHlkTAVO2UqRiD31",
    specs: {
      throughput: "800,000 pph",
      laserType: "CO2 & UV",
      accuracy: "±0.05mm",
    },
    tags: ["laser", "drilling", "precision", "pharmaceutical"],
  },
  "aarp": {
    name: "AARP Printer",
    description: "Advanced angle ramp printer for confectionery and pharma",
    pdfFolder: "1Tro43bEyvh0ZMpZQuHlkTAVO2UqRiD31",
    specs: {
      throughput: "1,200,000 pph",
      angle: "30 degrees",
      reliability: "99.2%",
    },
    tags: ["printing", "speed", "reliability", "angle-ramp"],
  },
  "servo": {
    name: "Servo Ramp Printer",
    description: "Servo-driven cantilever printer with integrated inspection",
    pdfFolder: "1Tro43bEyvh0ZMpZQuHlkTAVO2UqRiD31",
    specs: {
      throughput: "800,000 pph",
      inspection: "Vision Integrated",
      precision: "±0.02mm",
    },
    tags: ["servo", "cantilever", "inspection", "integration"],
  },
  "spin": {
    name: "SPIN System",
    description: "Integrated inspection and marking system",
    pdfFolder: "1Tro43bEyvh0ZMpZQuHlkTAVO2UqRiD31",
    specs: {
      imageCapture: "5000 fps",
      defectDetection: "98.5%",
      latency: "<50ms",
    },
    tags: ["inspection", "integration", "quality", "vision"],
  },
};

export function getGoogleDriveFolderUrl(): string {
  return "https://drive.google.com/drive/folders/1Tro43bEyvh0ZMpZQuHlkTAVO2UqRiD31?usp=share_link";
}

export function getMachineResources(machineId: string) {
  return MACHINE_RESOURCES[machineId as keyof typeof MACHINE_RESOURCES];
}

export function getAllResources() {
  return Object.entries(MACHINE_RESOURCES).map(([id, resource]) => ({
    id,
    ...resource,
  }));
}
