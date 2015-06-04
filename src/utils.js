export function defaultify (options, defaults) {
  let keys = Object.keys(defaults);

  for (let i = keys.length-1; i >= 0; --i) {
    let key = keys[i]

    if(typeof options[key] === 'undefined')
      options[key] = defaults[key];
  }
}

export function fileCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function clone (object) {
  return JSON.parse(JSON.stringify(object));
}