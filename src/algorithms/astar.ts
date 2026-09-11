import type { Storm } from '../types';

// ─── Grid Constants ───
const COLS = 40;
const ROWS = 30;
const CELL = 20; // px per cell

interface GridNode {
  col: number;
  row: number;
  walkable: boolean;
}

interface AStarNode {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

// 8-directional offsets: [dCol, dRow, cost]
const DIRS: [number, number, number][] = [
  [0, -1, 1.0],   // N
  [1, -1, 1.414], // NE
  [1, 0, 1.0],    // E
  [1, 1, 1.414],  // SE
  [0, 1, 1.0],    // S
  [-1, 1, 1.414], // SW
  [-1, 0, 1.0],   // W
  [-1, -1, 1.414],// NW
];

/**
 * Build the 40×30 walkability grid.
 * A cell is blocked if the distance from its center to any storm center <= storm.radius + 15px.
 */
function buildGrid(storms: Storm[]): GridNode[][] {
  const grid: GridNode[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: GridNode[] = [];
    for (let c = 0; c < COLS; c++) {
      const cx = c * CELL + CELL / 2; // cell center X in pixels
      const cy = r * CELL + CELL / 2; // cell center Y in pixels
      let walkable = true;
      for (const storm of storms) {
        const dx = cx - storm.x;
        const dy = cy - storm.y;
        if (Math.sqrt(dx * dx + dy * dy) <= storm.radius + 15) {
          walkable = false;
          break;
        }
      }
      row.push({ col: c, row: r, walkable });
    }
    grid.push(row);
  }
  return grid;
}

/** Convert pixel coordinate to grid column/row */
function pixelToGrid(px: number, py: number): [number, number] {
  const col = Math.max(0, Math.min(COLS - 1, Math.floor(px / CELL)));
  const row = Math.max(0, Math.min(ROWS - 1, Math.floor(py / CELL)));
  return [col, row];
}

/** Convert grid column/row to pixel center */
function gridToPixel(col: number, row: number): { x: number; y: number } {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

/** Octile distance heuristic */
function heuristic(c1: number, r1: number, c2: number, r2: number): number {
  const dx = Math.abs(c1 - c2);
  const dy = Math.abs(r1 - r2);
  return Math.max(dx, dy) + (1.414 - 1) * Math.min(dx, dy);
}

/** Unique key for grid position */
function nodeKey(col: number, row: number): string {
  return `${col},${row}`;
}

/**
 * A* pathfinding from startPoint to targetPoint, avoiding storm zones.
 * Returns array of pixel waypoints [{x, y}, ...].
 * Falls back to straight-line if no path found (destination enclosed).
 */
export function runAStar(
  startPoint: { x: number; y: number },
  targetPoint: { x: number; y: number },
  storms: Storm[]
): { x: number; y: number }[] {
  const grid = buildGrid(storms);
  const [sc, sr] = pixelToGrid(startPoint.x, startPoint.y);
  const [tc, tr] = pixelToGrid(targetPoint.x, targetPoint.y);

  // If start or target is in a blocked cell, find nearest walkable cell
  const start = findWalkable(grid, sc, sr);
  const target = findWalkable(grid, tc, tr);

  // Same cell — just return target
  if (start.col === target.col && start.row === target.row) {
    return [startPoint, targetPoint];
  }

  // ─── A* Search ───
  const open = new Map<string, AStarNode>();
  const closed = new Set<string>();

  const startNode: AStarNode = {
    col: start.col,
    row: start.row,
    g: 0,
    h: heuristic(start.col, start.row, target.col, target.row),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  open.set(nodeKey(startNode.col, startNode.row), startNode);

  let iterations = 0;
  const MAX_ITER = 5000;

  while (open.size > 0 && iterations < MAX_ITER) {
    iterations++;

    // Find node with lowest f in open set
    let current: AStarNode | null = null;
    for (const node of open.values()) {
      if (!current || node.f < current.f || (node.f === current.f && node.h < current.h)) {
        current = node;
      }
    }
    if (!current) break;

    // Goal check
    if (current.col === target.col && current.row === target.row) {
      return reconstructPath(current, startPoint, targetPoint);
    }

    const curKey = nodeKey(current.col, current.row);
    open.delete(curKey);
    closed.add(curKey);

    // Expand neighbors
    for (const [dc, dr, cost] of DIRS) {
      const nc = current.col + dc;
      const nr = current.row + dr;

      // Bounds check
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;

      // Walkability check
      if (!grid[nr][nc].walkable) continue;

      // Diagonal movement: prevent corner-cutting through blocked cells
      if (dc !== 0 && dr !== 0) {
        if (!grid[current.row][current.col + dc]?.walkable || !grid[current.row + dr]?.[current.col]?.walkable) {
          continue;
        }
      }

      const nKey = nodeKey(nc, nr);
      if (closed.has(nKey)) continue;

      const tentativeG = current.g + cost;

      const existing = open.get(nKey);
      if (existing && tentativeG >= existing.g) continue;

      const neighbor: AStarNode = {
        col: nc,
        row: nr,
        g: tentativeG,
        h: heuristic(nc, nr, target.col, target.row),
        f: 0,
        parent: current,
      };
      neighbor.f = neighbor.g + neighbor.h;
      open.set(nKey, neighbor);
    }
  }

  // ─── Fallback: straight line ───
  return straightLinePath(startPoint, targetPoint);
}

/** Find the nearest walkable cell via BFS spiral outward */
function findWalkable(
  grid: GridNode[][],
  col: number,
  row: number
): { col: number; row: number } {
  if (grid[row]?.[col]?.walkable) return { col, row };

  const visited = new Set<string>();
  const queue: [number, number][] = [[col, row]];
  visited.add(nodeKey(col, row));

  while (queue.length > 0) {
    const [c, r] = queue.shift()!;
    for (const [dc, dr] of DIRS) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      const key = nodeKey(nc, nr);
      if (visited.has(key)) continue;
      visited.add(key);
      if (grid[nr][nc].walkable) return { col: nc, row: nr };
      queue.push([nc, nr]);
    }
  }

  // Everything blocked — just return original
  return { col, row };
}

/** Reconstruct path from A* result, returning pixel waypoints */
function reconstructPath(
  endNode: AStarNode,
  startPixel: { x: number; y: number },
  targetPixel: { x: number; y: number }
): { x: number; y: number }[] {
  const gridPath: { x: number; y: number }[] = [];
  let node: AStarNode | null = endNode;
  while (node) {
    gridPath.unshift(gridToPixel(node.col, node.row));
    node = node.parent;
  }

  // Replace first and last with exact pixel coordinates
  if (gridPath.length > 0) {
    gridPath[0] = startPixel;
    gridPath[gridPath.length - 1] = targetPixel;
  }

  // Simplify: remove collinear intermediate points
  return simplifyPath(gridPath);
}

/** Remove collinear intermediate points for cleaner rendered lines */
function simplifyPath(path: { x: number; y: number }[]): { x: number; y: number }[] {
  if (path.length <= 2) return path;

  const result = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = path[i];
    const next = path[i + 1];

    // Check if the direction changes
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    // If direction changes, keep this point
    if (Math.sign(dx1) !== Math.sign(dx2) || Math.sign(dy1) !== Math.sign(dy2) ||
        (dx1 === 0) !== (dx2 === 0) || (dy1 === 0) !== (dy2 === 0)) {
      result.push(curr);
    }
  }
  result.push(path[path.length - 1]);
  return result;
}

/** Straight-line fallback with interpolated steps */
function straightLinePath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): { x: number; y: number }[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(2, Math.ceil(dist / CELL));
  const path: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    path.push({ x: start.x + dx * t, y: start.y + dy * t });
  }
  return path;
}

/** Calculate the total pixel distance along a path */
export function pathDistance(path: { x: number; y: number }[]): number {
  let dist = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    dist += Math.sqrt(dx * dx + dy * dy);
  }
  return dist;
}
