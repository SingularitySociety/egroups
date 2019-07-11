
export const array_diff = (a: any[], b: any[]) => {
  let new_b = b.slice();
  const new_a = a.filter((i) => {
    const ret = b.indexOf(i) < 0;
    if (!ret) {
      new_b = new_b.filter((elem) => {return elem !== i});
    }
    return ret;
  });

  return [new_a, new_b];
};

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export const isNull = (suspect) => {
  return suspect === null || suspect === undefined;
}
