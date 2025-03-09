const createRoom = (x, y, nearestX, nearestY) => ({
  x: x.toString(),
  y: y.toString(),
  nearestPoint: {
    x: nearestX ? nearestX.toString() : "",
    y: nearestY ? nearestY.toString() : "",
  },
});

const rooms = {
  110: createRoom(441, 953, 562, 1221),
  115: createRoom(850, 827, 813, 986),
  118: createRoom(1107, 1026, 1153, 1081),
  toilet: createRoom(723, 1044, 808, 1049),
  elevator: createRoom(967, 1157, 968, 1096),
  "entrance-east": createRoom(1363, 1351, 1363, 1351),
  "main-stairs": createRoom(1339, 1196, 1240, 1216),
  "underground-stairs": createRoom(1074, 1446, 1172, 1439),
  "entrance-south": createRoom(485, 1469, 507, 1432),
  "Main lobby": createRoom(539, 1299, 558, 1321),
};

const graph = {
  110: {
    "Main lobby": 1,
  },
  115: {
    toilet: 1,
  },
  118: {
    toilet: 1,
    "main-stairs": 1,
  },
  "Main lobby": {
    110: 1,
    "entrance-south": 1,
    toilet: 1,
    "underground-stairs": 3,
  },
  "entrance-south": {
    "Main lobby": 1,
  },
  toilet: {
    115: 1,
    118: 1,
    "Main lobby": 1,
    elevator: 1,
  },
  elevator: {
    toilet: 1,
  },
  "main-stairs": {
    118: 1,
    "entrance-east": 1,
  },
  "entrance-east": {
    "main-stairs": 1,
    "underground-stairs": 1,
  },
  "underground-stairs": {
    "entrance-east": 1,
    "Main lobby": 3,
  },
};

export { rooms, graph };
