import type { Category } from "@/types/api";
import type { SelectOption } from "@/components/ui";

/** Flattens the category tree into indented `<Select>` options (depth-prefixed). */
export function flattenCategoryOptions(nodes: Category[], depth = 0): SelectOption[] {
  return nodes.flatMap((node) => [
    { value: node.id, label: `${"  ".repeat(depth)}${node.name}` },
    ...flattenCategoryOptions(node.children ?? [], depth + 1),
  ]);
}
