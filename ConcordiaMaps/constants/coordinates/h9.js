const createRoom = (x, y, nearestX, nearestY) => ({
  x: x.toString(),
  y: y.toString(),
  nearestPoint: {
    x: nearestX ? nearestX.toString() : "",
    y: nearestY ? nearestY.toString() : "",
  },
});

const rooms = {
  elevator: createRoom(340, 294, 357, 399),
  H903: createRoom(190, 126, 192, 222),
  H906: createRoom(470, 205, 480, 224),
  H907: createRoom(301, 127, 332, 221),
  checkpoint1: createRoom("", "", 530, 224),
  H909: createRoom(549, 124, 568, 224),
  H911: createRoom(634, 125, 644, 224),
  H913: createRoom(714, 126, 724, 224),
  H915: createRoom(813, 125, 832, 224),
  H917: createRoom(880, 119, 832, 224),
  H919: createRoom(882, 193, 832, 224),
  H921: createRoom(878, 285, 842, 339),
  H920: createRoom(751, 362, 842, 435),
  H923: createRoom(878, 381, 842, 435),
  H925: createRoom(948, 444, 842, 498),
  checkpoint2: createRoom("", "", 818, 648),
  H927: createRoom(884, 692, 825, 742),
  H929: createRoom(829, 832, 818, 848),
  H933: createRoom(726, 873, 769, 845),
  H928: createRoom(812, 807, 769, 845),
  H932: createRoom(729, 806, 769, 845),
  H937: createRoom(615, 726, 668, 746),
  turn1: createRoom("", "", 706, 840),
  checkpoint3: createRoom("", "", 646, 651),
  checkpoint4: createRoom("", "", 508, 646),
  checkpoint5: createRoom("", "", 417, 676),
  H981: createRoom(357, 732, 402, 759),
  H945: createRoom(357, 746, 402, 801),
  H943: createRoom(363, 809, 392, 877),
  H941: createRoom(405, 835, 392, 877),
  H961_33: createRoom(340, 873, 351, 901),
  H961_31: createRoom(295, 873, 306, 901),
  H961_29: createRoom(269, 817, 264, 901),
  H961_30: createRoom(254, 817, 264, 901),
  H961_27: createRoom(212, 874, 221, 901),
  H961_28: createRoom(213, 817, 221, 901),
  H961_25: createRoom(166, 874, 176, 901),
  H961_23: createRoom(118, 874, 129, 901),
  H961_26: createRoom(118, 820, 129, 901),
  H961_21: createRoom(71, 875, 82, 901),
  H961_19: createRoom(39, 856, 82, 901),
  H961_17: createRoom(41, 816, 79, 870),
  H961_15: createRoom(41, 775, 79, 829),
  H961_13: createRoom(41, 732, 79, 789),
  H961_14: createRoom(104, 735, 79, 789),
  H961_11: createRoom(46, 678, 79, 732),
  H961_12: createRoom(97, 678, 79, 732),
  H961_9: createRoom(45, 640, 79, 695),
  H961_10: createRoom(101, 640, 79, 695),
  checkpoint6: createRoom("", "", 86, 664),
  H961_7: createRoom(45, 594, 86, 664),
  H961_6: createRoom(100, 548, 79, 604),
  H961_3: createRoom(44, 548, 79, 604),
  H961_4: createRoom(100, 505, 79, 560),
  H961_1: createRoom(48, 464, 79, 518),
  H961_2: createRoom(102, 464, 79, 518),
  H961_8: createRoom(167, 642, 180, 662),
  H968: createRoom(220, 582, 230, 665),
  H966: createRoom(360, 586, 370, 665),
  H960: createRoom(432, 414, 507, 465),
  checkpoint7: createRoom("", "", 525, 411),
  H980: createRoom(554, 357, 525, 411),
  H914: createRoom(487, 273, 529, 327),
  H962: createRoom(363, 385, 373, 408),
  H964: createRoom(281, 386, 291, 405),
  H963: createRoom(135, 351, 186, 404),
  H965: createRoom(124, 280, 186, 334),
  H967: createRoom(39, 149, 194, 222),
  women_washroom: createRoom(388, 206, 398, 221),
  men_washroom: createRoom(634, 210, 644, 221),
  water_foutain_S: createRoom(669, 211, 679, 221),
  water_foutain_N: createRoom(778, 638, 788, 647),
  stairs_NE: createRoom(292, 636, 302, 665),
  stairs_NW: createRoom(708, 635, 718, 647),
  stairs_SE: createRoom(259, 317, 269, 401),
  stairs_SW: createRoom(711, 209, 721, 221),
  escalator: createRoom(472, 440, 528, 494),
};

const graph = {
  H903: { H967: 1, H907: 1 },
  H907: { H903: 1, checkpoint1: 1 },
  H906: { H906: 1, checkpoint1: 1, women_washroom: 1 },
  checkpoint1: {
    H909: 1,
    H906: 1,
    H914: 1,
    H907: 1,
    men_washroom: 1,
    water_foutain_S: 1,
  },
  H914: { checkpoint1: 1, h980: 0.5 },
  H909: { checkpoint1: 1, H911: 1 },
  H911: { H909: 1, H913: 1, men_washroom: 0.5 },
  H913: { H911: 1, H915: 1, stairs_SW: 0.5 },
  H915: { H913: 1, H917: 1 },
  H917: { H915: 1, H919: 1 },
  H919: { H917: 1, H921: 1 },
  H921: { H919: 1, H923: 1 },
  H923: { H921: 1, H920: 0.5, H925: 1 },
  H920: { H923: 0.5 },
  H925: { checkpoint2: 1, H923: 1 },
  checkpoint2: { H925: 1, H927: 1, water_foutain_N: 0.5 },
  H927: { checkpoint2: 1, H929: 1 },
  H929: { H933: 1, H927: 1 },
  H933: { H928: 0.5, H932: 0.5, H929: 1, turn1: 1 },
  H932: { H933: 0.5 },
  H928: { H933: 0.5 },
  turn1: { H937: 1, H933: 1 },
  H937: { turn1: 1, checkpoint3: 1 },
  checkpoint3: { checkpoint4: 1, stairs_NW: 1, H937: 1 },
  checkpoint4: { checkpoint3: 1, checkpoint5: 1, escalator: 1 },
  checkpoint5: { H966: 1, checkpoint4: 1, H981: 1 },
  H981: { H945: 1, checkpoint5: 1 },
  H945: { H981: 1, H943: 1 },
  H943: { H941: 0.5, H961_33: 1, H945: 1 },
  H941: { H943: 0.5 },
  H961_33: { H943: 1, H961_31: 1 },
  H961_31: { H961_33: 1, H961_29: 1 },
  H961_29: { H961_31: 1, H961_30: 0.5, H961_27: 1 },
  H961_30: { H961_29: 0.5 },
  H961_27: { H961_29: 1, H961_25: 1, H961_28: 0.5 },
  H961_28: { H961_27: 0.5 },
  H961_25: { H961_27: 1, H961_23: 1 },
  H961_23: { H961_25: 1, H961_21: 1 },
  H961_21: { H961_19: 1, H961_23: 1 },
  H961_19: { H961_21: 1, H961_17: 1 },
  H961_17: { H961_19: 1, H961_15: 1, H961_26: 0.5 },
  H961_26: { H961_17: 0.5 },
  H961_15: { H961_17: 1, H961_13: 1 },
  H961_13: { H961_15: 1, H961_11: 1, H961_14: 0.5 },
  H961_14: { H961_13: 0.5 },
  H961_11: { H961_13: 1, H961_9: 1, H961_12: 0.5 },
  H961_12: { H961_11: 0.5 },
  H961_9: { H961_11: 1, checkpoint6: 1, H961_10: 0.5 },
  H961_10: { H961_9: 0.5, checkpoint6: 1 },
  checkpoint6: { H961_9: 1, H961_7: 1, H961_8: 1, H961_10: 1 },
  H961_7: { checkpoint6: 1, H961_6: 1 },
  H961_6: { H961_7: 1, H961_3: 1 },
  H961_3: { H961_4: 0.5, H961_6: 1, H961_1: 1 },
  H961_4: { H961_3: 0.5 },
  H961_1: { H961_3: 1, H961_2: 0.5 },
  H961_2: { H961_1: 0.5 },
  H961_8: { checkpoint6: 1, H968: 1 },
  H968: { H961_8: 1, stairs_NE: 1, H966: 1 },
  H966: { checkpoint5: 1, stairs_NE: 1, H968: 1 },
  checkpoint7: { H980: 0.5, H962: 1, escalator: 1, elevator: 1 },
  H980: { checkpoint7: 0.5, H914: 0.5 },
  H962: { checkpoint7: 1, elevator: 0.5, H964: 1 },
  elevator: { H962: 1, stairs_SE: 0.5, checkpoint7: 1 },
  H964: { H962: 1, H963: 1, stairs_SE: 0.5 },
  H963: { H965: 1, H964: 1, stairs_SE: 1 },
  H967: { H965: 1, H903: 1 },
  H965: { H963: 1, H967: 1 },
  men_washroom: {
    H911: 0.5,
    water_foutain_S: 0.1,
    checkpoint1: 1,
    stairs_SW: 1,
  },
  women_washroom: { H906: 1, H907: 0.5 },
  water_foutain_S: { men_washroom: 0.1, stairs_SW: 1, checkpoint1: 1 },
  water_foutain_N: { stairs_NW: 0.5, checkpoint2: 0.5 },
  stairs_NE: { H966: 1, H968: 1 },
  stairs_NW: { checkpoint3: 1, water_foutain_N: 0.5 },
  stairs_SE: { H964: 0.5, elevator: 0.5, H963: 1 },
  stairs_SW: { water_foutain_S: 1, H913: 0.5, men_washroom: 1 },
  escalator: { checkpoint7: 1, checkpoint4: 1 },
};

export { rooms, graph };
