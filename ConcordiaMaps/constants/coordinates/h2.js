const createRoom = (x, y, nearestX, nearestY) => ({
  x: x.toString(),
  y: y.toString(),
  nearestPoint: {
    x: nearestX ? nearestX.toString() : "",
    y: nearestY ? nearestY.toString() : "",
  },
});

const rooms = {
  H205: createRoom(1092, 539, "1122", "510"),
  H209: createRoom(1139, 483, "1117", "514"),
  H217: createRoom(397, 753, "407", "720"),
  H224: createRoom(683, 625, "636", "578"),
  H225: createRoom(1109, 754, "1137", "759"),
  H231: createRoom(746, 948, "770", "1010"),
  H235: createRoom(961, 1068, "939", "1053"),
  H260: createRoom(112, 520, "173", "534"),
  H275: createRoom(64, 822, "92", "797"),
  H280: createRoom(115, 768, "105", "734"),
  H281: createRoom(154, 764, "131", "732"),
  H290: createRoom(1051, 663, "1031", "709"),
  H298: createRoom(115, 381, "115", "381"),
  "H231.00": createRoom(1105, 959, "", ""),
  "H231.06": createRoom(1170, 1019, "", ""),
  "H231.15": createRoom(993, 978, "934", "975"),
  exit: createRoom(1068, 756, "1087", "758"),
  "H231.31": createRoom(853, 971, "792", "976"),
  "H223.04": createRoom(841, 941, "854", "912"),
  "H213.90": createRoom(915, 910, "912", "831"),
  "H231.03": createRoom(834, 868, "843", "897"),
  "emergency stairs": createRoom(115, 405, "164", "381"),
  "H231.05": createRoom(776, 868, "793", "893"),
  "H258.18": createRoom(681, 932, "673", "961"),
  "H239.19": createRoom(704, 976, "681", "985"),
  "H239.00": createRoom(532, 1027, "532", "800"),
  "H239.95": createRoom(670, 983, "670", "1019"),
  "H239.04": createRoom(624, 873, "627", "822"),
  "H219.05": createRoom(632, 946, "622", "919"),
  "H239.02": createRoom(590, 900, "593", "973"),
  "H222.01": createRoom(193, 761, "234", "766"),
  "H222.00": createRoom(325, 770, "231", "724"),
  "H224-1": createRoom(680, 476, "680", "476"),
  "H290-1": createRoom(1095, 619, "1136", "598"),
  escalator: createRoom(539, 383, "", ""),
  "escalator Down": createRoom(480, 283, "327", "371"),
  "stairs 1st Floor": createRoom(532, 297, "532", "358"),
  elevator: createRoom(405, 330, "403", "361"),
};

const graph = {
  H298: {
    H260: 1,
    stairs: 1,
  },
  H260: {
    H298: 1,
    H280: 2,
  },
  stairs: {
    H298: 1,
    "escalator West First Floor": 0.5,
  },
  "stairs East": {
    "escalator East First Floor": 0.5,
    "escalator down Third Floor": 1,
  },
  "escalator West First Floor": {
    stairs: 0.5,
    elevator: 1,
  },
  "escalator East First Floor": {
    elevator: 1,
    "stairs East": 0.5,
  },
  escalator: {
    "escalator down Third Floor": 0.5,
  },
  "escalator down Third Floor": {
    "stairs East": 1,
    escalator: 0.5,
    "H224-1": 0.5,
  },
  H275: {
    "H224-1": 2,
    H209: 2,
  },
  "H224-1": {
    "escalator down Third Floor": 0.5,
    H224: 1,
    H275: 2,
  },
  H224: {
    "H224-1": 1,
  },
  H209: {
    H275: 2,
    H205: 1,
  },
  H205: {
    H209: 1,
    "H290-1": 0.5,
  },
  "H290-1": {
    H205: 0.5,
    H290: 0.5,
  },
  H290: {
    "H290-1": 0.5,
    H225: 1,
  },
  H280: {
    H260: 2,
    "H252-1": 1,
    H281: 0.5,
  },
  H281: {
    "H222.01": 0.5,
    "H222.00": 0.5,
    H280: 0.5,
  },
  "H222.01": {
    H281: 0.5,
    "H222.00": 0.5,
  },
  "H222.00": {
    H281: 0.5,
    "H222.01": 0.5,
    H217: 0.5,
  },
  H217: {
    "H222.00": 0.5,
    "H239.00": 2,
  },
  "H252-1": {
    H280: 1,
  },
  "H239.00": {
    H217: 2,
    "H239.16": 0.5,
  },
  "H239.16": {
    "H239.00": 0.5,
    "H219.05": 1,
    "H239.05": 0.5,
  },
  "H239.02": {
    "H219.05": 0.5,
    "H239.04": 0.5,
  },
  "H239.04": {
    "H239.02": 0.5,
    "H258.18": 0.5,
  },
  H225: {
    H290: 1,
    H283: 1,
    "H231.00": 2,
  },
  "H220.97": {
    "H231.03": 1,
  },
  "H219.05": {
    "H239.16": 1,
    "H239.02": 0.5,
  },
  "H258.18": {
    "H239.04": 0.5,
    "H239.19": 0.5,
  },
  "H239.19": {
    "H258.18": 0.5,
    "H239.05": 0.5,
    H231: 0.5,
  },
  "H239.05": {
    "H239.16": 0.5,
    "H239.19": 0.5,
  },
  H231: {
    "H239.19": 0.5,
    "H231.05": 1,
    "H231.31": 1,
  },
  "H231.05": {
    H231: 1,
  },
  elevator: {
    "escalator West First Floor": 1,
    "escalator East First Floor": 1,
  },
  "H231.03": {
    "H223.04": 0.5,
    "H220.97": 1,
  },
  "H231.31": {
    H231: 1,
    "H223.04": 0.5,
    "H231.15": 1,
  },
  "H223.04": {
    "H231.31": 0.5,
    "H231.03": 0.5,
    "H213.90": 0.5,
  },
  "H213.90": {
    "H223.04": 0.5,
    H283: 1,
  },
  H283: {
    "H213.90": 1,
    H225: 1,
  },
  "H231.15": {
    "H231.31": 1,
    "H231.00": 1,
  },
  "H231.00": {
    "H231.15": 1,
    "H231.06": 1,
    H225: 2,
  },
  "H231.06": {
    "H231.00": 1,
  },
};

export { rooms, graph };
