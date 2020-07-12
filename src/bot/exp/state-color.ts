export type StateColor = number;

export const colorFromState = (state: string): StateColor => {
  switch (state) {
    case 'open':
      return 0x11aa11;
    case 'closed':
      return 0xaa1111;
    default:
      return 0x000000;
  }
};
