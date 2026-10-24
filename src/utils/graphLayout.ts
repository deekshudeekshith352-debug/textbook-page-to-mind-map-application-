import { MapLayout, MindMapEdge, MindMapNode } from '../types/mindmap';

export interface LayoutedNode extends MindMapNode {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  branchColor: string;
  hasHiddenChildren?: boolean;
  hiddenCount?: number;
}

// Color palettes for branches
export const BRANCH_PALETTES = {
  emerald: ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'],
  indigo: ['#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#a855f7', '#f43f5e', '#eab308'],
  amber: ['#f59e0b', '#ea580c', '#e11d48', '#84cc16', '#06b6d4', '#8b5cf6', '#d97706'],
  slate: ['#475569', '#3b82f6', '#0d9488', '#e11d48', '#7c3aed', '#d97706', '#2563eb'],
  cyber: ['#06b6d4', '#f43f5e', '#a855f7', '#22c55e', '#eab308', '#ec4899', '#38bdf8'],
};

// Node dimensions
export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 100;
export const ROOT_WIDTH = 260;
export const ROOT_HEIGHT = 110;

/**
 * Returns Set of descendant IDs for a given node
 */
export function getSubtreeNodeIds(nodeId: string, nodes: MindMapNode[]): Set<string> {
  const descendants = new Set<string>();
  const childrenMap = new Map<string, string[]>();

  nodes.forEach((n) => {
    if (n.parentId) {
      const list = childrenMap.get(n.parentId) || [];
      list.push(n.id);
      childrenMap.set(n.parentId, list);
    }
  });

  function traverse(id: string) {
    const children = childrenMap.get(id) || [];
    children.forEach((cId) => {
      descendants.add(cId);
      traverse(cId);
    });
  }

  traverse(nodeId);
  return descendants;
}

/**
 * Returns Set of ancestor IDs for a given node up to root
 */
export function getAncestorNodeIds(nodeId: string, nodes: MindMapNode[]): Set<string> {
  const ancestors = new Set<string>();
  const parentMap = new Map<string, string | null>();
  nodes.forEach((n) => parentMap.set(n.id, n.parentId));

  let current = parentMap.get(nodeId);
  while (current) {
    ancestors.add(current);
    current = parentMap.get(current);
  }
  return ancestors;
}

/**
 * Computes depth of all nodes from root
 */
export function computeDepths(nodes: MindMapNode[]): Map<string, number> {
  const depthMap = new Map<string, number>();
  const parentMap = new Map<string, string | null>();
  nodes.forEach((n) => parentMap.set(n.id, n.parentId));

  function getDepth(id: string): number {
    if (depthMap.has(id)) return depthMap.get(id)!;
    const parentId = parentMap.get(id);
    if (!parentId) {
      depthMap.set(id, 0);
      return 0;
    }
    const d = getDepth(parentId) + 1;
    depthMap.set(id, d);
    return d;
  }

  nodes.forEach((n) => getDepth(n.id));
  return depthMap;
}

/**
 * Main layout computation function supporting left-to-right, tree, radial, top-to-bottom, and flowchart
 */
export function computeMindMapLayout(
  nodes: MindMapNode[],
  layout: MapLayout = 'left-to-right',
  theme: keyof typeof BRANCH_PALETTES = 'indigo',
  collapsedMap: Record<string, boolean> = {},
  customPositions: Record<string, { x: number; y: number }> = {}
): { layoutNodes: LayoutedNode[]; visibleEdges: MindMapEdge[]; bounds: { minX: number; maxX: number; minY: number; maxY: number } } {
  if (!nodes || nodes.length === 0) {
    return { layoutNodes: [], visibleEdges: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
  }

  const root = nodes.find((n) => !n.parentId || n.id === 'root') || nodes[0];
  const childrenMap = new Map<string, MindMapNode[]>();
  nodes.forEach((n) => {
    if (n.parentId) {
      const list = childrenMap.get(n.parentId) || [];
      list.push(n);
      childrenMap.set(n.parentId, list);
    }
  });

  const palette = BRANCH_PALETTES[theme] || BRANCH_PALETTES.indigo;
  const branchColorMap = new Map<string, string>();
  const rootChildren = childrenMap.get(root.id) || [];
  rootChildren.forEach((child, idx) => {
    const col = palette[idx % palette.length];
    branchColorMap.set(child.id, col);
    const subDescendants = getSubtreeNodeIds(child.id, nodes);
    subDescendants.forEach((dId) => branchColorMap.set(dId, col));
  });

  // Calculate visible nodes taking collapsing into account
  const hiddenNodeIds = new Set<string>();
  Object.keys(collapsedMap).forEach((collapsedNodeId) => {
    if (collapsedMap[collapsedNodeId]) {
      const descendants = getSubtreeNodeIds(collapsedNodeId, nodes);
      descendants.forEach((id) => hiddenNodeIds.add(id));
    }
  });

  const visibleNodes = nodes.filter((n) => !hiddenNodeIds.has(n.id));
  const depths = computeDepths(visibleNodes);

  // Layout strategies
  const positions = new Map<string, { x: number; y: number }>();

  if (layout === 'left-to-right') {
    // Hierarchical horizontal tree
    // Calculate required vertical height for each subtree
    function calcSubtreeHeight(nodeId: string): number {
      const children = (childrenMap.get(nodeId) || []).filter((c) => !hiddenNodeIds.has(c.id));
      if (children.length === 0 || collapsedMap[nodeId]) {
        return NODE_HEIGHT + 24;
      }
      return children.reduce((sum, c) => sum + calcSubtreeHeight(c.id), 0);
    }

    function positionLR(nodeId: string, currentX: number, startY: number) {
      const isRoot = nodeId === root.id;
      const w = isRoot ? ROOT_WIDTH : NODE_WIDTH;
      const h = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
      const totalH = calcSubtreeHeight(nodeId);
      const centerY = startY + totalH / 2;

      positions.set(nodeId, { x: currentX, y: centerY - h / 2 });

      if (collapsedMap[nodeId]) return;

      const children = (childrenMap.get(nodeId) || []).filter((c) => !hiddenNodeIds.has(c.id));
      let childY = startY;
      const nextX = currentX + (isRoot ? 320 : 300);

      children.forEach((child) => {
        const childH = calcSubtreeHeight(child.id);
        positionLR(child.id, nextX, childY);
        childY += childH;
      });
    }

    const totalTreeHeight = calcSubtreeHeight(root.id);
    positionLR(root.id, 0, -totalTreeHeight / 2);
  } else if (layout === 'top-to-bottom') {
    // Hierarchical vertical tree
    function calcSubtreeWidth(nodeId: string): number {
      const children = (childrenMap.get(nodeId) || []).filter((c) => !hiddenNodeIds.has(c.id));
      if (children.length === 0 || collapsedMap[nodeId]) {
        return NODE_WIDTH + 32;
      }
      return children.reduce((sum, c) => sum + calcSubtreeWidth(c.id), 0);
    }

    function positionTB(nodeId: string, startX: number, currentY: number) {
      const isRoot = nodeId === root.id;
      const w = isRoot ? ROOT_WIDTH : NODE_WIDTH;
      const h = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
      const totalW = calcSubtreeWidth(nodeId);
      const centerX = startX + totalW / 2;

      positions.set(nodeId, { x: centerX - w / 2, y: currentY });

      if (collapsedMap[nodeId]) return;

      const children = (childrenMap.get(nodeId) || []).filter((c) => !hiddenNodeIds.has(c.id));
      let childX = startX;
      const nextY = currentY + (isRoot ? 180 : 160);

      children.forEach((child) => {
        const childW = calcSubtreeWidth(child.id);
        positionTB(child.id, childX, nextY);
        childX += childW;
      });
    }

    const totalTreeWidth = calcSubtreeWidth(root.id);
    positionTB(root.id, -totalTreeWidth / 2, 0);
  } else if (layout === 'radial') {
    // 360-degree radial orbits around central root
    positions.set(root.id, { x: -ROOT_WIDTH / 2, y: -ROOT_HEIGHT / 2 });

    const visibleRootChildren = rootChildren.filter((c) => !hiddenNodeIds.has(c.id));
    const angleStep = (2 * Math.PI) / (visibleRootChildren.length || 1);
    const radiusLevel1 = 360;

    visibleRootChildren.forEach((child, idx) => {
      const angle = idx * angleStep;
      const cx = Math.cos(angle) * radiusLevel1 - NODE_WIDTH / 2;
      const cy = Math.sin(angle) * radiusLevel1 - NODE_HEIGHT / 2;
      positions.set(child.id, { x: cx, y: cy });

      if (!collapsedMap[child.id]) {
        const subChildren = (childrenMap.get(child.id) || []).filter((sc) => !hiddenNodeIds.has(sc.id));
        const subArc = angleStep * 0.85;
        const subStartAngle = angle - subArc / 2;
        const subStep = subChildren.length > 1 ? subArc / (subChildren.length - 1) : 0;
        const radiusLevel2 = radiusLevel1 + 280;

        subChildren.forEach((sub, sIdx) => {
          const sAngle = subChildren.length === 1 ? angle : subStartAngle + sIdx * subStep;
          const sx = Math.cos(sAngle) * radiusLevel2 - NODE_WIDTH / 2;
          const sy = Math.sin(sAngle) * radiusLevel2 - NODE_HEIGHT / 2;
          positions.set(sub.id, { x: sx, y: sy });

          // Level 3 items if present
          if (!collapsedMap[sub.id]) {
            const leafChildren = (childrenMap.get(sub.id) || []).filter((lc) => !hiddenNodeIds.has(lc.id));
            const radiusLevel3 = radiusLevel2 + 260;
            leafChildren.forEach((leaf, lIdx) => {
              const leafAngle = sAngle + (lIdx - (leafChildren.length - 1) / 2) * 0.22;
              const lx = Math.cos(leafAngle) * radiusLevel3 - NODE_WIDTH / 2;
              const ly = Math.sin(leafAngle) * radiusLevel3 - NODE_HEIGHT / 2;
              positions.set(leaf.id, { x: lx, y: ly });
            });
          }
        });
      }
    });
  } else if (layout === 'flowchart') {
    // Sequential flow layout with sequential levels and side branches
    let curY = 0;
    positions.set(root.id, { x: -ROOT_WIDTH / 2, y: curY });
    curY += 160;

    const visibleRootChildren = rootChildren.filter((c) => !hiddenNodeIds.has(c.id));
    visibleRootChildren.forEach((child, idx) => {
      const isEven = idx % 2 === 0;
      const stepX = isEven ? -160 : 160;
      positions.set(child.id, { x: stepX - NODE_WIDTH / 2, y: curY });

      if (!collapsedMap[child.id]) {
        const subChildren = (childrenMap.get(child.id) || []).filter((sc) => !hiddenNodeIds.has(sc.id));
        subChildren.forEach((sub, sIdx) => {
          const subX = stepX + (isEven ? -260 : 260) - NODE_WIDTH / 2;
          const subY = curY + sIdx * 110;
          positions.set(sub.id, { x: subX, y: subY });
        });
      }
      curY += 150;
    });
  } else {
    // Classic balanced tree (bidirectional Left and Right branches)
    positions.set(root.id, { x: -ROOT_WIDTH / 2, y: -ROOT_HEIGHT / 2 });

    const visibleRootChildren = rootChildren.filter((c) => !hiddenNodeIds.has(c.id));
    const rightBranch = visibleRootChildren.slice(0, Math.ceil(visibleRootChildren.length / 2));
    const leftBranch = visibleRootChildren.slice(Math.ceil(visibleRootChildren.length / 2));

    function positionSide(branchList: MindMapNode[], direction: 1 | -1) {
      let sideY = -((branchList.length * 150) / 2);
      branchList.forEach((child) => {
        const cx = direction * 320 - (direction === -1 ? NODE_WIDTH : 0);
        positions.set(child.id, { x: cx, y: sideY });

        if (!collapsedMap[child.id]) {
          const subChildren = (childrenMap.get(child.id) || []).filter((sc) => !hiddenNodeIds.has(sc.id));
          let subY = sideY - ((subChildren.length * 110) / 2) + 50;
          subChildren.forEach((sub) => {
            const sx = cx + direction * 280;
            positions.set(sub.id, { x: sx, y: subY });
            subY += 115;
          });
        }
        sideY += 150;
      });
    }

    positionSide(rightBranch, 1);
    positionSide(leftBranch, -1);
  }

  // Override positions with any manual user drag offsets
  Object.keys(customPositions).forEach((id) => {
    if (customPositions[id]) {
      positions.set(id, customPositions[id]);
    }
  });

  // Assemble layout nodes
  const layoutNodes: LayoutedNode[] = visibleNodes.map((n) => {
    const isRoot = n.id === root.id || !n.parentId;
    const w = isRoot ? ROOT_WIDTH : NODE_WIDTH;
    const h = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
    const pos = positions.get(n.id) || { x: 0, y: 0 };
    const allChildren = childrenMap.get(n.id) || [];
    const isCollapsed = Boolean(collapsedMap[n.id]);
    const hiddenDescendants = isCollapsed ? getSubtreeNodeIds(n.id, nodes).size : 0;

    return {
      ...n,
      x: pos.x,
      y: pos.y,
      width: w,
      height: h,
      depth: depths.get(n.id) || 0,
      branchColor: isRoot ? '#4f46e5' : branchColorMap.get(n.id) || '#0ea5e9',
      hasHiddenChildren: isCollapsed && allChildren.length > 0,
      hiddenCount: hiddenDescendants,
    };
  });

  // Calculate bounding box
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  if (layoutNodes.length > 0) {
    minX = Math.min(...layoutNodes.map((n) => n.x));
    maxX = Math.max(...layoutNodes.map((n) => n.x + n.width));
    minY = Math.min(...layoutNodes.map((n) => n.y));
    maxY = Math.max(...layoutNodes.map((n) => n.y + n.height));
  }

  // Filter visible edges
  const visibleNodeIdSet = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges: MindMapEdge[] = [];

  nodes.forEach((n) => {
    if (n.parentId && visibleNodeIdSet.has(n.id) && visibleNodeIdSet.has(n.parentId)) {
      visibleEdges.push({
        id: `e-${n.parentId}-${n.id}`,
        source: n.parentId,
        target: n.id,
      });
    }
  });

  return { layoutNodes, visibleEdges, bounds: { minX, maxX, minY, maxY } };
}

/**
 * Creates smooth SVG bezier curve between two nodes
 */
export function generateConnectorPath(
  source: LayoutedNode,
  target: LayoutedNode,
  layout: MapLayout = 'left-to-right'
): string {
  // Source center & target center
  const sCenterX = source.x + source.width / 2;
  const sCenterY = source.y + source.height / 2;
  const tCenterX = target.x + target.width / 2;
  const tCenterY = target.y + target.height / 2;

  if (layout === 'top-to-bottom') {
    const startX = sCenterX;
    const startY = source.y + source.height;
    const endX = tCenterX;
    const endY = target.y;
    const deltaY = endY - startY;
    const cp1Y = startY + deltaY * 0.5;
    const cp2Y = startY + deltaY * 0.5;
    return `M ${startX} ${startY} C ${startX} ${cp1Y}, ${endX} ${cp2Y}, ${endX} ${endY}`;
  }

  if (layout === 'flowchart') {
    // Stepped right-angle with rounded corner
    const startX = sCenterX;
    const startY = source.y + source.height;
    const endX = tCenterX;
    const endY = target.y;
    const midY = (startY + endY) / 2;
    return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
  }

  // Left to right or Tree
  let startX = source.x + source.width;
  let startY = sCenterY;
  let endX = target.x;
  let endY = tCenterY;

  // If target is to the left of source (e.g. radial or bidirectional tree)
  if (tCenterX < sCenterX) {
    startX = source.x;
    endX = target.x + target.width;
  }

  const deltaX = endX - startX;
  const cp1X = startX + deltaX * 0.5;
  const cp2X = startX + deltaX * 0.5;

  return `M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`;
}
