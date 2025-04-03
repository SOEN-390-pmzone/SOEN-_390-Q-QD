/**
 * Building connections data
 * Defines how buildings are connected on campus (tunnels, bridges, etc.)
 */
const buildingConnections = [
    {
      building1: 'hall',
      building2: 'library',
      type: 'tunnel',
      distance: 180 // meters
    },
    {
      building1: 'hall',
      building2: 'ev',
      type: 'bridge',
      distance: 50 // meters
    },
    {
      building1: 'ev',
      building2: 'mb',
      type: 'tunnel',
      distance: 250 // meters
    },
    {
      building1: 'library',
      building2: 'mb',
      type: 'tunnel',
      distance: 300 // meters
    },
    {
      building1: 'hall',
      building2: 'jmsb',
      type: 'tunnel',
      distance: 400 // meters
    },
    // Loyola campus connections
    {
      building1: 'vl',
      building2: 've',
      type: 'tunnel',
      distance: 75 // meters
    }
  ];
  
  export default buildingConnections;