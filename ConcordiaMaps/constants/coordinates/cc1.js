const rooms = {
  // User-provided coordinates
  men_washroom: {
    x: "1060",
    y: "822",
    nearestPoint: {
      x: "1038",
      y: "1114",
    },
  },
  women_washroom: {
    x: "5500",
    y: "748",
    nearestPoint: {
      x: "5462",
      y: "1103",
    },
  },
  water_fountain: {
    x: "5358",
    y: "1084",
    nearestPoint: {
      x: "5358",
      y: "1084",
    },
  },
  checkpoint: {
    x: "800",
    y: "1150",
    nearestPoint: {
      x: "800",
      y: "1150",
    },
  },
  122: {
    x: "1450",
    y: "800",
    nearestPoint: {
      x: "1500",
      y: "1128",
    },
  },
  120: {
    x: "1645",
    y: "800",
    nearestPoint: {
      x: "1645",
      y: "1128",
    },
  },
  119: {
    x: "1645",
    y: "1400",
    nearestPoint: {
      x: "1645",
      y: "1156",
    },
  },
  // Additional estimated coordinates
  118: {
    x: "2260",
    y: "800",
    nearestPoint: {
      x: "2260",
      y: "1128",
    },
  },
  117: {
    x: "2260",
    y: "1400",
    nearestPoint: {
      x: "2260",
      y: "1156",
    },
  },
  116: {
    x: "2516",
    y: "800",
    nearestPoint: {
      x: "2516",
      y: "1128",
    },
  },
  115: {
    x: "2516",
    y: "1400",
    nearestPoint: {
      x: "2516",
      y: "1156",
    },
  },
  "112-2": {
    x: "3380",
    y: "701",
    nearestPoint: {
      x: "3412",
      y: "850",
    },
  },
  "112-1": {
    x: "3464",
    y: "950",
    nearestPoint: {
      x: "3440",
      y: "1128",
    },
  },
  112: {
    x: "4000",
    y: "800",
    nearestPoint: {
      x: "4000",
      y: "1128",
    },
  },
  111: {
    x: "4000",
    y: "1400",
    nearestPoint: {
      x: "4000",
      y: "1156",
    },
  },
  109: {
    x: "4288",
    y: "1400",
    nearestPoint: {
      x: "4288",
      y: "1256",
    },
  },
  stairs: {
    x: "4225",
    y: "900",
    nearestPoint: {
      x: "4225",
      y: "897",
    },
  },
  stairs2: {
    x: "2280",
    y: "830",
    nearestPoint: {
      x: "2260",
      y: "1128",
    },
  },
  elevator: {
    x: "4400",
    y: "950",
    nearestPoint: {
      x: "4400",
      y: "1128",
    },
  },
  107: {
    x: "4400",
    y: "1300",
    nearestPoint: {
      x: "4400",
      y: "1156",
    },
  },
  101: {
    x: "5100",
    y: "1400",
    nearestPoint: {
      x: "5100",
      y: "1128",
    },
  },
  106: {
    x: "4600",
    y: "950",
    nearestPoint: {
      x: "4600",
      y: "1128",
    },
  },
  170: {
    x: "5924",
    y: "1020",
    nearestPoint: {
      x: "2750",
      y: "1150",
    },
  },
  "190-2": {
    x: "6280",
    y: "980",
    nearestPoint: {
      x: "6440",
      y: "940",
    },
  },
  "190-4": {
    x: "6250",
    y: "1340",
    nearestPoint: {
      x: "6440",
      y: "1370",
    },
  },
  checkpoint2: {
    x: "6440",
    y: "1150",
    nearestPoint: {
      x: "6440",
      y: "1150",
    },
  },
};

// Graph representing connections between rooms and checkpoints with distances
const graph = {
  // Main checkpoint connections

  122: {
    men_washroom: 1.2,
    120: 0.5,
  },
  120: {
    122: 0.5,
    119: 1,
    118: 1.5,
  },
  119: {
    120: 1,
    117: 2,
    checkpoint: 3,
  },

  // Middle section - central corridor
  118: {
    120: 1.5,
    stairs2: 0.3,
    116: 1,
    117: 0.5,
  },
  stairs2: {
    118: 0.3,
    116: 0.8,
  },
  117: {
    119: 2,
    118: 1,
    115: 1,
  },
  116: {
    118: 1,
    stairs2: 1,
    115: 0.3,
    "112-1": 1.5,
  },
  115: {
    117: 1,
    116: 1,
    111: 1.5,
  },

  // Section with auditoriums and stairs
  "112-2": {
    "112-1": 0.5,
  },

  "112-1": {
    "112-2": 0.5,
    112: 0.8,
  },
  112: {
    "112-1": 0.8,
    111: 0.5,
    " stairs": 0.8,
    elevator: 1,
  },
  111: {
    115: 1.5,
    112: 0.5,
    109: 1,
  },
  stairs: {
    112: 0.8,
    elevator: 0.5,
    106: 1,
  },

  // Section near elevator
  elevator: {
    stairs: 0.5,
    112: 1,
    107: 0.5,
    106: 0.5,
  },
  107: {
    elevator: 1,
    109: 0.8,
    101: 1.5,
  },
  109: {
    111: 1,
    107: 0.3,
    101: 1.8,
    elevator: 0.8,
    stairs: 1,
  },

  // Section near second checkpoint
  106: {
    elevator: 0.5,
    101: 0.5,
    women_washroom: 1.5,
  },
  101: {
    109: 1.8,
    107: 1.5,
    106: 0.5,
    water_fountain: 1,
  },
  women_fountain: {
    water_fountain: 0.5,
  },
  water_fountain: {
    101: 1,
    170: 1,
  },

  170: {
    water_fountain: 1,

    checkpoint2: 1.2,
  },
  "190-2": {
    "190-4": 0.8,
    checkpoint2: 0.8,
  },
  "190-4": {
    "190-2": 0.8,
    checkpoint2: 0.8,
  },
};

export { rooms, graph };
