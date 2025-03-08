const rooms = {
    "191": {
        "x": "27",
        "y": "206",
        "nearestPoint": {
            "x": "33",
            "y": "177"
        }
    },
    "stairs": {
        "x": "147",
        "y": "123",
        "nearestPoint": {
            "x": "118",
            "y": "182"
        }
    },
    "elevator": {
        "x": "59",
        "y": "210",
        "nearestPoint": {
            "x": "58",
            "y": "180"
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