import _ from 'lodash';

// Множество элементов
export type Subset = Set<number>;

// Множество подмножеств элементов
export type Topology = Set<Subset>;

// Генерация всех возможных подмножеств множества (1, ..., n), кроме пустого.
export function generateAllSubsets(n: number): Array<Subset> {
  if (n === 1) {
    return [new Set([1])];
  }

  const minorSubsets: Array<Subset> = generateAllSubsets(n-1);

  return [
    // Подмножества без n-го элемента
    ...minorSubsets,

    // Подмножество из одного элемента (n)
    new Set([n]),

    // Подмножества с n элементом
    ...minorSubsets.map((subset: Subset) => new Set([...Array.from(subset), n])),
  ];
}

export function* topologyGenerator(n: number): Iterable<Topology> {
  const allSubsets = generateAllSubsets(n);
  const fullSet = allSubsets[allSubsets.length - 1];

  for(let bitmask=0; bitmask<(1<<allSubsets.length-1); bitmask++) {
    const topology = new Set([fullSet]);

    for(let i=0; i<allSubsets.length-1; i++) {
      const bit = 1 << i;
      if (bitmask & bit) {
        topology.add(allSubsets[i]);
      }
    }

    if (validateTopology(topology)) {
      yield topology;
    }
  }
}

export function validateTopology(topology: Topology): boolean {
  const subsetKey = (subset: Iterable<number>) => {
    return _.sortBy(_.uniq([...subset])).join('-');
  };

  const indexed = _.keyBy([...topology], subsetKey);

  for(let _a of topology) {
    for(let _b of topology) {
      const a = [..._a];
      const b = [..._b];
      // union should be in topology
      const union = _.union(a, b)
      if (!indexed[subsetKey(union)]) {
        //console.log("!!!topology -- union-fail", indexed, subsetKey(union));
        return false;
      }
      // intersection should be in topology (or empty)
      const intersection = _.intersection(a, b);
      if (intersection.length && !indexed[subsetKey(intersection)]) {
        //console.log("!!!topology -- intersection-fail", topology, subsetKey(intersection));
        return false;
      }
    }
  }

  return true;
}

function main() {
  // console.log("!!!generateAllSubsets", generateAllSubsets(3));

  const iterator = topologyGenerator(4);
  let count = 0;
  for (const topology of iterator) {
    //console.log("!!!topology", topology);
    count++;
  }
  console.log("!!!topologyCount", count);
}

main();
