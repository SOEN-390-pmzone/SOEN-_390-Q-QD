const NavbarStateManager = {
  isMenuOpen: false,
  listeners: [],

  // Update the menu state
  setMenuOpen(isOpen) {
    this.isMenuOpen = isOpen;
    // Notify all listeners
    this.listeners.forEach((listener) => listener(isOpen));
  },

  // Get current menu state
  getMenuOpen() {
    return this.isMenuOpen;
  },

  // Subscribe to menu state changes
  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },
};

export default NavbarStateManager;
