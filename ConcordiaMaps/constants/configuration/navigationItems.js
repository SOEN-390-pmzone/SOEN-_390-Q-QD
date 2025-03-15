/**
 * Navigation menu items configuration
 * NavBar.js component handles the actual implementation
 * Each item should have:
 * - id: unique identifier
 * - label: display text
 * - action: function reference (to be completed in NavBar component)
 * - screen: the screen it should lead to
 */
export const navigationItems = [
    {
      id: 'login',
      label: 'Login',
      actionType: 'alert',
      // Navigation component will handle the actual implementation
    },
    {
      id: 'directions',
      label: 'Get directions',
      actionType: 'navigate',
      screen: 'GetDirections',
    },
    {
      id: 'indoor',
      label: 'Indoor Navigation',
      actionType: 'navigate',
      screen: 'BuildingSelector',
    },
    {
      id: 'room-to-room',
      label: 'Room-to-Room Navigation',
      actionType: 'navigate',
      screen: 'RoomToRoomNavigation',
    },
    {
      id: 'poi',
      label: 'Outdoor Points of Interest',
      actionType: 'alert',
    },
    {
      id: 'planner',
      label: 'Smart Planner',
      actionType: 'alert',
    },
    {
      id: 'shuttle',
      label: 'Shuttle Schedule',
      actionType: 'custom',
      testID: 'shuttle-schedule-modal',
    },
  ];