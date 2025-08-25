export function sanitizeLocations<T>(data: T): T {
  const replace = (str: string) =>
    str.replace(/California/g, 'San Andreas').replace(/Los Angeles/g, 'Los Santos');

  const traverse = (val: any): any => {
    if (typeof val === 'string') {
      return replace(val);
    }
    if (Array.isArray(val)) {
      return val.map(traverse);
    }
    if (val && typeof val === 'object') {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) => [k, traverse(v)])
      );
    }
    return val;
  };

  return traverse(data);
}
