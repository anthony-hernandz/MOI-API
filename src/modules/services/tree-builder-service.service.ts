import { Injectable, Logger } from '@nestjs/common';

interface TreeNode<T> {
  id: string;
  id_parent: string | null;
  children?: T[];
  [key: string]: any;
}

@Injectable()
export class TreeBuilderService {
  private readonly logger = new Logger(TreeBuilderService.name);

  /**
   * Valida si hay relaciones circulares en los datos jerárquicos
   */
  hasCircularReferences<T extends TreeNode<T>>(nodes: T[]): boolean {
    const nodeMap = new Map<string, T>();
    nodes.forEach((node) => nodeMap.set(node.id, node));

    for (const node of nodes) {
      const currentId = node.id;
      let parentId = node.id_parent;
      const visited = new Set<string>();
      visited.add(currentId);

      while (parentId) {
        if (visited.has(parentId)) {
          this.logger.error(
            `Relación circular detectada: ${currentId} => ${parentId}`,
          );
          return true;
        }

        visited.add(parentId);
        const parentNode = nodeMap.get(parentId);
        if (!parentNode) break;

        parentId = parentNode.id_parent ?? null;
      }
    }

    return false;
  }

  /**
   * Construye el árbol jerárquico desde una lista plana
   */
  buildTree<T extends TreeNode<T>>(
    nodes: T[],
    parentId: string | null = null,
  ): T[] {
    return nodes
      .filter((node) => (node.id_parent ?? null) === parentId)
      .map((node) => ({
        ...node,
        children: this.buildTree(nodes, node.id),
      }));
  }

  /**
   * Construye el árbol jerárquico sin recursión profunda, de forma eficiente
   */
  buildTreeEfficient<T extends TreeNode<T>>(flatList: T[]): T[] {
    const nodeMap = new Map<string, T & { children: T[] }>();
    const tree: (T & { children: T[] })[] = [];

    // Inicializa el mapa con cada nodo y su array de hijos
    for (const node of flatList) {
      nodeMap.set(node.id, { ...node, children: [] });
    }

    // Conecta cada nodo con su padre (si existe)
    for (const node of nodeMap.values()) {
      if (node.id_parent && nodeMap.has(node.id_parent)) {
        const parent = nodeMap.get(node.id_parent);
        parent!.children.push(node);
      } else {
        tree.push(node); // raíz (sin padre)
      }
    }

    return tree;
  }

  /**
   * Método completo: valida y construye árbol
   */
  buildSafeTree<T extends TreeNode<T>>(nodes: T[]): T[] {
    if (this.hasCircularReferences(nodes)) {
      throw new Error(
        '❌ No se puede construir el árbol: relación circular detectada.',
      );
    }

    return this.buildTreeEfficient(nodes);
  }
}
