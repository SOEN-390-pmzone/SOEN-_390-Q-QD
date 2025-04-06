import {
  formatRoomNumber,
  isSpecialRoom,
  processRoomInput,
  SPECIAL_ROOMS,
} from "../../utils/RoomFormattingUtils";

describe("RoomFormattingUtils", () => {
  describe("formatRoomNumber", () => {
    test("should return input if buildingId or roomText is falsy", () => {
      expect(formatRoomNumber(null, "123")).toBe("123");
      expect(formatRoomNumber("H", "")).toBe("");
      expect(formatRoomNumber("", "123")).toBe("123");
      expect(formatRoomNumber(undefined, "123")).toBe("123");
    });

    test("should handle Hall building redundant prefixes", () => {
      expect(formatRoomNumber("H", "HH123")).toBe("H-123");
      expect(formatRoomNumber("H", "H-H123")).toBe("H-123");
      expect(formatRoomNumber("H", "HH-123")).toBe("H-123");
      expect(formatRoomNumber("H", "H-H-123")).toBe("H-123");
    });

    test("should format MB rooms correctly", () => {
      expect(formatRoomNumber("MB", "1.293")).toBe("MB-1.293");
      expect(formatRoomNumber("MB", "1-293")).toBe("MB-1-293");
      expect(formatRoomNumber("MB", "123")).toBe("MB-123");
      expect(formatRoomNumber("MB", "MB-123")).toBe("MB-123");
    });

    test("should format VE, VL, and EV rooms correctly", () => {
      // Special rooms
      expect(formatRoomNumber("VE", "stairs")).toBe("stairs");
      expect(formatRoomNumber("VL", "ELEVATOR")).toBe("elevator");
      expect(formatRoomNumber("EV", "Toilet")).toBe("toilet");

      // Just numbers
      expect(formatRoomNumber("VE", "101")).toBe("VE-101");
      expect(formatRoomNumber("VL", "202")).toBe("VL-202");
      expect(formatRoomNumber("EV", "303")).toBe("EV-303");

      // Already formatted
      expect(formatRoomNumber("VE", "VE-101")).toBe("VE-101");
      expect(formatRoomNumber("VL", "VL-202")).toBe("VL-202");
      expect(formatRoomNumber("EV", "EV-303")).toBe("EV-303");

      // Other formats
      expect(formatRoomNumber("VE", "room101")).toBe("VE-room101");
    });

    test("should format default building rooms correctly", () => {
      expect(formatRoomNumber("LB", "101")).toBe("LB-101");
      expect(formatRoomNumber("FG", "FG-101")).toBe("FG-101");
      expect(formatRoomNumber("VA", "room101")).toBe("VA-room101");
    });

    test("should trim input strings", () => {
      expect(formatRoomNumber("H", "  123  ")).toBe("H-123");
      expect(formatRoomNumber("MB", " MB-123 ")).toBe("MB-123");
    });
  });

  describe("isSpecialRoom", () => {
    test("should identify special rooms correctly", () => {
      SPECIAL_ROOMS.forEach((room) => {
        expect(isSpecialRoom(room)).toBe(true);
        expect(isSpecialRoom(room.toUpperCase())).toBe(true);
      });
    });

    test("should return false for non-special rooms", () => {
      expect(isSpecialRoom("101")).toBe(false);
      expect(isSpecialRoom("H-101")).toBe(false);
      expect(isSpecialRoom("conference_room")).toBe(false);
    });
  });

  describe("processRoomInput", () => {
    test("should call setRoomFn with formatted room", () => {
      const setRoomFn = jest.fn();
      const setInvalidFn = jest.fn();
      const floorRegistry = { isValidRoom: jest.fn().mockReturnValue(true) };

      const result = processRoomInput(
        "H",
        "123",
        setRoomFn,
        setInvalidFn,
        floorRegistry
      );

      expect(result).toBe("H-123");
      expect(setRoomFn).toHaveBeenCalledWith("H-123");
      expect(floorRegistry.isValidRoom).toHaveBeenCalledWith("H", "H-123");
      expect(setInvalidFn).toHaveBeenCalledWith(false);
    });

    test("should set invalid state for invalid rooms", () => {
      const setRoomFn = jest.fn();
      const setInvalidFn = jest.fn();
      const floorRegistry = { isValidRoom: jest.fn().mockReturnValue(false) };

      processRoomInput("H", "999", setRoomFn, setInvalidFn, floorRegistry);

      expect(setInvalidFn).toHaveBeenCalledWith(true);
    });

    test("should not validate empty room input", () => {
      const setRoomFn = jest.fn();
      const setInvalidFn = jest.fn();
      const floorRegistry = { isValidRoom: jest.fn() };

      processRoomInput("H", "", setRoomFn, setInvalidFn, floorRegistry);

      expect(floorRegistry.isValidRoom).not.toHaveBeenCalled();
      expect(setInvalidFn).toHaveBeenCalledWith(false);
    });
  });
});
