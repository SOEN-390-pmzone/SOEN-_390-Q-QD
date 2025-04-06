const createRoom = (x, y, nearestX, nearestY) => ({
  x: x.toString(),
  y: y.toString(),
  nearestPoint: {
    x: nearestX ? nearestX.toString() : "",
    y: nearestY ? nearestY.toString() : "",
  },
});

const rooms = {
  // Main rooms
  102: createRoom(52, 644, 131, 673),
  103: createRoom(629, 623, 634, 570),
  104: createRoom(689, 731, 684, 641),
  110: createRoom(674, 300, 619, 296),
  112: createRoom(674, 216, 619, 216),
  116: createRoom(743, 300, 799, 309),
  118: createRoom(743, 238, 809, 238),
  119: createRoom(834, 264, 809, 260),
  120: createRoom(768, 344, 708, 353),
  121: createRoom(649, 79, 619, 149),
  122: createRoom(388, 402, 545, 433),
  126: createRoom(456, 251, 456, 344),
  128: createRoom(314, 255, 334, 349),
  130: createRoom(274, 189, 294, 145),
  140: createRoom(824, 776, 799, 722),
  194: createRoom(186, 474, 314, 491),
  195: createRoom(62, 947, 146, 921),
  197: createRoom(794, 709, 794, 700),
  "Main lobby": createRoom(264, 148, 264, 148),
  "entrance-east": createRoom(225, 140, 225, 140),
  
  // Numbered rooms and sections
  "127-5": createRoom(304, 83, 329, 145),
  "127-4": createRoom(398, 79, 412, 127),
  "127-3": createRoom(443, 88, 447, 132),
  "127-2": createRoom(496, 83, 471, 123),
  "127-1": createRoom(525, 114, 476, 149),
  "121-1": createRoom(554, 110, 559, 154),
  "elevator-center": createRoom(664, 180, 615, 185),
  "stairs-center": createRoom(559, 260, 660, 260),
  "elevator-west": createRoom(190, 149, 220, 154),
  "stairs-west": createRoom(220, 344, 225, 344),
  "elevator": createRoom(834, 349, 814, 349),
  "elevator-east-2": createRoom(834, 145, 814, 149),
  "106-2": createRoom(758, 384, 713, 389),
  "106-1": createRoom(768, 429, 723, 433),
  "stairs-east": createRoom(894, 482, 884, 522),
  "103-1": createRoom(753, 623, 703, 609),
  "122-1": createRoom(264, 429, 284, 491),
  "194-3": createRoom(235, 553, 279, 553),
  "102-31": createRoom(205, 597, 259, 606),
  "102-2": createRoom(146, 601, 161, 664),
  "toilet": createRoom(47, 713, 146, 713),
  "101-7": createRoom(57, 757, 131, 753),
  "101-6": createRoom(57, 796, 116, 809),
  "101-5": createRoom(67, 837, 116, 846),
  "stairs-south": createRoom(81, 911, 111, 881),
  "101-3": createRoom(308, 868, 269, 848),
  "101-4": createRoom(312, 912, 273, 892),
  "101-1": createRoom(615, 664, 559, 664),
  "101-2": createRoom(614, 704, 558, 704),
  "stairs-south-east": createRoom(708, 704, 709, 664),
  "197-1": createRoom(795, 553, 795, 553)
};

const graph = {
  "102": {
      "toilet": 1,
      "102-2": 1
  },
  "103": {
      "104": 1,
      "101-1": 1,
      "103-1": 1,
      "106-1":2,
      "122":2
  },
  "104": {
      "103": 1,
      "101-1": 1,
      "103-1": 1
  },
  "110": {
      "112": 1,
      "120": 1,
      "stairs-center": 1
  },
  "112": {
      "110": 1,
      "elevator-center": 1,
      "stairs-center": 1
  },
  "116": {
      "118": 1,
      "119": 1
  },
  "118": {
      "116": 1,
      "119": 1,
      "elevator-east-2": 1,
      "elevator-center": 1
  },
  "119": {
      "116": 1,
      "118": 1,
      "elevator": 1,
      "elevator-east-2": 1
  },
  "120": {
      "110": 1,
      "106-2": 0.5
  },
  "121": {
      "elevator-center": 1,
      "121-1": 1
  },
  "122": {
      "122-1": 1,
      "103":2,
      "stairs-center":1
  },
  "124": {
      "128": 1,
      "stairs-west": 1
  },
  "126": {
      "128": 1,
      "stairs-center": 1
  },
  "128": {
      "124": 1,
      "126": 1,
      "stairs-west": 1
  },
  "130": {
      "127-5": 1,
      "elevator-west": 1
  },
  "140": {
      "197": 0.5,
      "stairs-south-east": 0.5
  },
  "194": {
      "194-3": 1,
      "122-1": 1
  },
  "195": {
      "stairs-south": 0.5
  },
  "197": {
      "140": 0.5,
      "197-1": 0.5
  },
  "toilet": {
      "102": 1,
      "101-7": 1
  },
  "entrance-east": {
      "Main lobby": 0.2
  },
  "Main lobby": {
      "entrance-east": 1,
      "127-5": 0.2,
      "130": 0.2
  },
  "101-7": {
      "toilet": 1,
      "101-6": 1
  },
  "101-6": {
      "101-7": 1,
      "101-5": 0.5
  },
  "101-5": {
      "101-6": 0.5,
      "stairs-south": 1
  },
  "stairs-south": {
      "195": 0.5,
      "101-5": 1,
      "101-4": 2
  },
  "101-4": {
      "stairs-south": 2,
      "101-3": 1
  },
  "101-3": {
      "101-4": 1,
      "101-2": 2
  },
  "102-2": {
      "102": 1,
      "102-31": 1
  },
  "102-31": {
      "102-2": 1,
      "194-3": 0.5
  },
  "194-3": {
      "194": 1,
      "102-31": 0.5
  },
  "122-1": {
      "122": 1,
      "194": 1,
  },
  "101-2": {
      "101-3": 2,
      "101-1": 1
  },
  "101-1": {
      "103": 1,
      "104": 1,
      "101-2": 1
  },
  "103-1": {
      "103": 1,
      "104": 1,
      "197-1": 0.5,
      "stairs-east": 2,
      "106-1": 1
  },
  "197-1": {
      "197": 0.5,
      "103-1": 0.5
  },
  "stairs-south-east": {
      "140": 0.5
  },
  "stairs-east": {
      "103-1": 2,
      "106-1": 1,
      "elevator": 1
  },
  "106-1": {
      "103-1": 1,
      "stairs-east": 1,
      "106-2": 0.5,
      "103":2
  },
  "106-2": {
      "120": 0.5,
      "106-1": 0.5
  },
  "elevator": {
      "119": 1,
      "stairs-east": 1
  },
  "elevator-east-2": {
      "118": 1,
      "119": 1
  },
  "elevator-center": {
      "112": 1,
      "118": 1,
      "121": 1
  },
  "stairs-center": {
      "110": 1,
      "112": 1,
      "126": 1,
      "121-1": 0.5,
      "122":1
  },
  "121-1": {
      "121": 1,
      "stairs-center": 0.5,
      "127-1":0.5
  },
  "127-1": {
      "121-1": 0.5,
      "127-2": 0.5
  },
  "stairs-west": {
      "124": 1,
      "128": 1
  },
  "127-2": {
      "127-1": 0.5,
      "127-3": 0.5
  },
  "127-3": {
      "127-2": 0.5,
      "127-4": 0.5
  },
  "127-4": {
      "127-3": 0.5,
      "127-5": 1
  },
  "127-5": {
      "130": 1,
      "127-4": 1,
      "elevator-west": 1
  },
  "elevator-west": {
      "127-5": 1,
      "130":1
  }
  
}


export { rooms, graph };