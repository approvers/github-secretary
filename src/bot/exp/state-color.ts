export type StateColor = number;

const green = 0x11aa11;
const red = 0xaa1111;
const black = 0x000000;

export const colorFromState = (state: string): StateColor => {
  switch (state) {
    case "open":
      return green;
    case "closed":
      return red;
    default:
      return black;
  }
};
