export const array_diff = (a: any[], b: any[]) => {
  a = a.filter((i) => {
    const ret = b.indexOf(i) < 0;
    if (!ret) {
      b = b.filter((elem) => {return elem !== i});
    }
    return ret;
  });

  return [a, b];
};