export const array_diff = (a: any[], b: any[]) => {
  return a.filter((i) => {return b.indexOf(i) < 0;});
};