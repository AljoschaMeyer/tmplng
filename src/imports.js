const {allImportedUEIs} = require('./ast');

// Takes a Resolver and returns a caching resolver.
//
// A Resolver is a function which takes a UEI and returns the promise of an
// Entity.
//
// The CachedResolver is a function which takes a UEI and returns the promise of an
// entity, just like the supplied Resolver. It caches the results of the resolver
// and only runs it when necessary.
exports.newCachedResolver = resolver => {
  const cache = new Map();

  return uei => {
    const cached = cache.get(uei);

    if (cached) {
      return Promise.resolve(cached);
    }

    return resolver(uei).then(entity => {
      cache.set(uei, entity);
      return Promise.resolve(entity);
    });
  };
};

// Internal function: `map` stores all CUs, `cu` is the current one, `uei` is its identifier
const addImports = (importer, map, cu, currentUEI) => {
  map.set(currentUEI, cu);

  const imports = allImportedUEIs(cu);

  Promise.all(imports.map(uei => {
    if (map.has(uei)) {
      return Promise.resolve();
    }
    return importer(uei).then(entity => addImports(importer, map, entity, uei));
  }))
    .then(() => {})
    .catch(err => ({importedFrom: currentUEI, err}));
};

// Returns the promise of a map containing all transitively imported CUs by their
// uei. Such a map is the starting point for code analyis.
//
// Fails if any import can not be resolved.
//
// `uei` is used as the key for the given CU.
exports.resolveImportsRecursively = (importer, cu, uei) => {
  const cus = new Map();
  return addImports(importer, cus, cu, uei).then(() => cus);
};
