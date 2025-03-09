const rooms = {
    "191": {
        "x": "131",
        "y": "711",
        "nearestPoint": {
            "x": "161",
            "y": "611"
        }
    },
    "stairs": {
        "x": "718",
        "y": "424",
        "nearestPoint": {
            "x": "576",
            "y": "628"
        }
    },
    "elevator": {
        "x": "288",
        "y": "725",
        "nearestPoint": {
            "x": "283",
            "y": "621"
        }
    }
}
const graph = {
    "191": {
        "elevator": 0.5
    },
    "stairs": {
        "elevator": 1
    },
    "elevator": {
        "191": 0.5,
        "stairs": 1
    }
}

export {rooms,graph}