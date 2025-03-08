const rooms = {
    "110": {
        "x": "441",
        "y": "953",
        "nearestPoint": {
            "x": "562",
            "y": "1221"
        }
    },
    "115": {
        "x": "850",
        "y": "827",
        "nearestPoint": {
            "x": "813",
            "y": "986"
        }
    },
    "118": {
        "x": "1107",
        "y": "1026",
        "nearestPoint": {
            "x": "1153",
            "y": "1081"
        }
    },
    "toilet": {
        "x": "723",
        "y": "1044",
        "nearestPoint": {
            "x": "808",
            "y": "1049"
        }
    },
    "elevator": {
        "x": "967",
        "y": "1157",
        "nearestPoint": {
            "x": "968",
            "y": "1096"
        }
    },
    "entrance-east": {
        "x": "1363",
        "y": "1351",
        "nearestPoint": {
            "x": "1363",
            "y": "1351"
        }
    },
    "main-stairs": {
        "x": "1339",
        "y": "1196",
        "nearestPoint": {
            "x": "1240",
            "y": "1216"
        }
    },
    "underground-stairs": {
        "x": "1074",
        "y": "1446",
        "nearestPoint": {
            "x": "1172",
            "y": "1439"
        }
    },
    "entrance-south": {
        "x": "485",
        "y": "1469",
        "nearestPoint": {
            "x": "507",
            "y": "1432"
        }
    },
    "Main lobby": {
        "x": "539",
        "y": "1299",
        "nearestPoint": {
            "x": "558",
            "y": "1321"
        }
    }
}
const graph = {
    "110": {
        "Main lobby": 1
    },
    "115": {
        "toilet": 1
    },
    "118": {
        "toilet": 1,
        "main-stairs": 1
    },
    "Main lobby": {
        "110": 1,
        "entrance-south": 1,
        "toilet": 1,
        "underground-stairs": 3
    },
    "entrance-south": {
        "Main lobby": 1
    },
    "toilet": {
        "115": 1,
        "118": 1,
        "Main lobby": 1,
        "elevator": 1
    },
    "elevator": {
        "toilet": 1
    },
    "main-stairs": {
        "118": 1,
        "entrance-east": 1
    },
    "entrance-east": {
        "main-stairs": 1,
        "underground-stairs": 1
    },
    "underground-stairs": {
        "entrance-east": 1,
        "Main lobby": 3
    }
}
export { rooms, graph };