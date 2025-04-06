const rooms = {
  191: {
    x: "131",
    y: "711",
    nearestPoint: {
      x: "161",
      y: "611",
    },
  },
  entrance: {
    x: "0",
    y: "625",
    nearestPoint: {
      x: "131",
      y: "625",
    },
  },
  stairs: {
    x: "718",
    y: "424",
    nearestPoint: {
      x: "576",
      y: "628",
    },
  },
  elevator: {
    x: "288",
    y: "725",
    nearestPoint: {
      x: "283",
      y: "621",
    },
  },
  "entrance-east": {
    x: "106",
    y: "613",
    nearestPoint: {
      x: "125",
      y: "613",
    },
  },
  "Main lobby": {
    x: "125",
    y: "613",
    nearestPoint: {
      x: "125",
      y: "613",
    },
  },
};
const graph = {
  entrance: {
    191: 0.5,
  },
  191: {
    elevator: 0.5,
    "Main lobby": 0.1,
  },
  stairs: {
    elevator: 1,
  },
  elevator: {
    191: 0.5,
    stairs: 1,
  },
  "entrance-east": {
    "Main lobby": 0.1,
  },
  "Main lobby": {
    "entrance-east": 0.1,
    191: 0.2,
  },
};

export { rooms, graph };
