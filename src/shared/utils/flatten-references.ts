import { FilterValues } from '../dtos/filter-table';

export function flattenReferences(nodes: FilterValues[]): FilterValues[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenReferences(node.children) : [])]);
}
