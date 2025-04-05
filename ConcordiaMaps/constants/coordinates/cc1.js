const rooms = {
  // User-provided coordinates
  124: {
    x: "1050",
    y: "800",
    nearestPoint: {
      x: "1049",
      y: "1128",
    },
  },
  "124-1": {
    x: "980",
    y: "800",
    nearestPoint: {
      x: "800",
      y: "990",
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
  104: {
    x: "5468",
    y: "950",
    nearestPoint: {
      x: "5468",
      y: "940",
    },
  },
  "104-2": {
    x: "5468",
    y: "1000",
    nearestPoint: {
      x: "5468",
      y: "1128",
    },
  },
  102: {
    x: "5555",
    y: "1000",
    nearestPoint: {
      x: "5555",
      y: "1017",
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
  checkpoint: {
    "124-1": 1,
  },

  checkpoint2: {
    "190-2": 0.8,
    "190-4": 0.8,
    170: 1.2,
  },

  // First section - rooms near checkpoint
  "124-1": {
    checkpoint: 1,
    124: 0.3,
  },
  124: {
    "124-1": 0.8,
  },

  122: {
    124: 1.2,
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
    104: 1.5,
  },
  101: {
    109: 1.8,
    107: 1.5,
    106: 0.5,
    "104-2": 1,
  },
  104: {
    102: 0.3,
    "104-2": 0.5,
  },
  "104-2": {
    104: 0.5,
    101: 1,
    102: 0.2,
    170: 1,
  },
  102: {
    "104-2": 0.2,
    104: 0.3,
  },

  170: {
    "104-2": 1,

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
