const createRoom = (x, y, nearestX, nearestY) => ({
  x: x.toString(),
  y: y.toString(),
  nearestPoint: {
    x: nearestX ? nearestX.toString() : "",
    y: nearestY ? nearestY.toString() : "",
  },
});

const rooms = {
  101: createRoom(100, 200, 150, 250),
  102: createRoom(200, 300, 250, 350),
  103: createRoom(300, 400, 350, 450),
  104: createRoom(400, 500, 450, 550),
  105: createRoom(500, 600, 550, 650),
  106: createRoom(600, 700, 650, 750),
  107: createRoom(700, 800, 750, 850),
  108: createRoom(800, 900, 850, 950),
  109: createRoom(900, 1000, 950, 1050),
  110: createRoom(1000, 1100, 1050, 1150),
};

const graph = {
  101: {
    102: 1,
  },
  102: {
    101: 1,
    103: 1,
  },
  103: {
    102: 1,
    104: 1,
  },
  104: {
    103: 1,
    105: 1,
  },
  105: {
    104: 1,
    106: 1,
  },
  106: {
    105: 1,
    107: 1,
  },
  107: {
    106: 1,
    108: 1,
  },
  108: {
    107: 1,
    109: 1,
  },
  109: {
    108: 1,
    110: 1,
  },
  110: {
    109: 1,
  },
};

export { rooms, graph };
