export const multiplyArray = <T>(arr: T[], times: number) => {
  return Array(times).fill(arr).flat();
};

export const randomAmong = (num1: number, num2: number) => {
  return Math.floor(Math.random() * (num2 - num1 + 1)) + num1;
};

export const chooseFrom = <T>(arr: T[]) => {
  return arr[randomAmong(0, arr.length - 1)];
};
