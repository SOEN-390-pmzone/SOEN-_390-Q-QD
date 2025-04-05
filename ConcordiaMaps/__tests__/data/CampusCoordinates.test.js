import { CampusCoordinates } from "../../constants/coordinates/CampusCoordinates";

describe("CampusCoordinates", () => {
  it("should have SGW and Loyola campuses defined", () => {
    expect(CampusCoordinates).toHaveProperty("SGW");
    expect(CampusCoordinates).toHaveProperty("Loyola");
  });

  it("should define correct latitude and longitude for SGW", () => {
    const { SGW } = CampusCoordinates;
    expect(SGW).toEqual(
      expect.objectContaining({
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      }),
    );

    expect(SGW.latitude).toBeCloseTo(45.4973, 4);
    expect(SGW.longitude).toBeCloseTo(-73.5789, 4);
    expect(SGW.latitudeDelta).toBe(0.01);
    expect(SGW.longitudeDelta).toBe(0.01);
  });

  it("should define correct latitude and longitude for Loyola", () => {
    const { Loyola } = CampusCoordinates;
    expect(Loyola).toEqual(
      expect.objectContaining({
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      }),
    );

    expect(Loyola.latitude).toBeCloseTo(45.458256, 4);
    expect(Loyola.longitude).toBeCloseTo(-73.640472, 4);
    expect(Loyola.latitudeDelta).toBe(0.01);
    expect(Loyola.longitudeDelta).toBe(0.01);
  });
});
