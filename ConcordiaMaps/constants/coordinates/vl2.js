const rooms = {
  201: {
    x: 699,
    y: 558,
    nearestPoint: {
      x: 699,
      y: 558,
    },
  },
  204: {
    x: 754,
    y: 420,
    nearestPoint: {
      x: 742,
      y: 347,
    },
  },
  205: {
    x: 793,
    y: 253,
    nearestPoint: {
      x: 740,
      y: 251,
    },
  },
  240: {
    x: 825,
    y: 762,
    nearestPoint: {
      x: 774,
      y: 698,
    },
  },
  297: {
    x: 809,
    y: 719,
    nearestPoint: {
      x: 779,
      y: 705,
    },
  },
  stairs_S: {
    x: 74,
    y: 943,
    nearestPoint: {
      x: 78,
      y: 906,
    },
  },
  "202-1": {
    x: 51,
    y: 837,
    nearestPoint: {
      x: 89,
      y: 772,
    },
  },
  stairs_W: {
    x: 194,
    y: 485,
    nearestPoint: {
      x: 270,
      y: 489,
    },
  },
  elevator: {
    x: 225,
    y: 521,
    nearestPoint: {
      x: 226,
      y: 566,
    },
  },
  "202-30": {
    x: 262,
    y: 431,
    nearestPoint: {
      x: 273,
      y: 489,
    },
  },
  stairs_E: {
    x: 769,
    y: 791,
    nearestPoint: {
      x: 733,
      y: 781,
    },
  },
  "201-95": {
    x: 782,
    y: 640,
    nearestPoint: {},
  },
  "201-1": {
    x: 666,
    y: 480,
    nearestPoint: {},
  },
  "203-1": {
    x: 659,
    y: 435,
    nearestPoint: {
      x: 620,
      y: 433,
    },
  },
  "203-2": {
    x: 664,
    y: 384,
    nearestPoint: {
      x: 665,
      y: 345,
    },
  },
  "203-3": {
    x: 705,
    y: 417,
    nearestPoint: {
      x: 701,
      y: 347,
    },
  },
  escalator: {
    x: 566,
    y: 260,
    nearestPoint: {
      x: 609,
      y: 260,
    },
  },
  women_washroom: {
    x: 675,
    y: 305,
    nearestPoint: {
      x: 620,
      y: 308,
    },
  },
  men_washroom: {
    x: 671,
    y: 224,
    nearestPoint: {
      x: 613,
      y: 220,
    },
  },
  water_fountain: {
    x: 653,
    y: 260,
    nearestPoint: {
      x: 615,
      y: 259,
    },
  },
};
const graph = {
  201: {
    297: 1,
    "201-1": 0.5,
    "203-1": 1,
    "203-2": 1,
    "201-95": 0.5,
    stairs_E: 2,
  },
  204: {
    "203-3": 1,
    "203-2": 1,
  },
  205: {
    "292-2": 2,
    escalator: 2,
    men_washroom: 2,
    water_fountain: 2,
    women_washroom: 2,
  },
  240: {
    297: 1,
    stairs_E: 1,
  },
  297: {
    201: 1,
    240: 1,
    "297-1": 0.5,
    stairs_E: 1,
  },
  "292-2": {
    205: 2,
    women_washroom: 1,
    water_fountain: 1,
    men_washroom: 1,
    escalator: 1,
  },
  escalator: {
    205: 2,
    women_washroom: 1,
    water_fountain: 1,
    men_washroom: 1,
    "292-2": 1,
  },
  men_washroom: {
    205: 2,
    women_washroom: 1,
    water_fountain: 1,
    escalator: 1,
    "292-2": 1,
  },
  women_washroom: {
    205: 2,
    men_washroom: 1,
    water_fountain: 1,
    escalator: 1,
    "292-2": 1,
    "203-2": 1,
    "203-3": 1,
  },
  water_fountain: {
    205: 2,
    women_washroom: 1,
    men_washroom: 1,
    escalator: 1,
    "292-2": 1,
  },
  "203-3": {
    204: 1,
    "203-2": 1,
    women_washroom: 1,
  },
  "203-2": {
    201: 1,
    204: 1,
    "203-3": 1,
    women_washroom: 1,
    "203-1": 1,
    stairs_W: 2,
  },
  "203-1": {
    201: 1,
    "203-2": 1,
    stairs_W: 2,
  },
  "201-1": {
    201: 0.5,
  },
  "201-95": {
    201: 0.5,
  },
  "297-1": {
    297: 0.5,
  },
  stairs_E: {
    201: 2,
    240: 1,
    297: 1,
  },
  stairs_S: {
    "202-1": 1,
    stairs_W: 2,
  },
  "202-1": {
    stairs_S: 1,
  },
  elevator: {
    stairs_W: 1,
    "202-30": 1,
  },
  stairs_W: {
    elevator: 1,
    stairs_S: 2,
    "202-30": 1,
    "203-1": 2,
    "203-2": 2,
  },
  "202-30": {
    elevator: 1,
    stairs_W: 1,
  },
};

export { rooms, graph };
