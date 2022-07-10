function createRow(id: number) {
  const table = document.getElementsByTagName("tbody")[0];

  const row = document.createElement("tr");
  table.appendChild(row);

  const header = document.createElement("th");
  header.innerHTML = `${id}`;
  row.appendChild(header);

  for (let i = 0; i < 8; ++i) {
    const tile = document.createElement("td");
    tile.classList.add("tile");

    const color = (i + id) % 2 == 0 ? "light" : "dark";
    tile.setAttribute("data-color", color);
    tile.classList.add(color);

    tile.setAttribute("id", makeTileId({ x: i, y: 8 - id }));

    row.appendChild(tile);
  }
}

for (let i = 8; i > 0; --i) {
  createRow(i);
}

interface PieceType {
  repr: {
    light: string;
    dark: string;
  };
}

interface Position {
  x: number;
  y: number;
}

interface Piece {
  type: PieceType;
  pos: Position;
  color: "light" | "dark";
}

type TileIdString = `tile-${number}-${number}`;
function makeTileId(pos: Position): TileIdString {
  const { x, y } = pos;
  return `tile-${x}-${y}` as TileIdString;
}

function placePiece(piece: Piece) {
  const tile = document.getElementById(makeTileId(piece.pos));

  tile.innerText = piece.type.repr[piece.color];
}

const Rook: PieceType = {
  repr: {
    light: "♖",
    dark: "♜",
  },
} as const;

const Knight: PieceType = {
  repr: {
    light: "♘",
    dark: "♞",
  },
} as const;

const Bishop: PieceType = {
  repr: {
    light: "♗",
    dark: "♝",
  },
} as const;

const Queen: PieceType = {
  repr: {
    light: "♕",
    dark: "♛",
  },
} as const;

const King: PieceType = {
  repr: {
    light: "♔",
    dark: "♚",
  },
} as const;

const Pawn: PieceType = {
  repr: {
    light: "♙",
    dark: "♟",
  },
} as const;

const rook: Piece = {
  type: Rook,
  pos: { x: 2, y: 1 },
  color: "dark",
};

const pawn: Piece = {
  type: Pawn,
  pos: { x: 6, y: 5 },
  color: "dark",
};

placePiece(rook);
placePiece(pawn);

interface Table {
  [key: string]: Piece;
}

function fromPiecesToTable(pieces: Piece[]): Table {
  return pieces.reduce((table, piece) => {
    return {
      ...table,
      [makeTileId(piece.pos)]: piece,
    };
  }, {} as Table);
}

console.log(fromPiecesToTable([rook]));

function sequence(from: number, to: number): number[] {
  let sequence = [];

  for (let i = from; i <= to; ++i) {
    sequence = [...sequence, i];
  }

  return sequence;
}

function getTile(pos: Position): HTMLElement {
  return document.getElementById(makeTileId(pos));
}

function selectTile(pos: Position) {
  const tile = getTile(pos);
  tile.classList.add("selected");
}

function getPieceInTable(pos: Position, table: Table): Piece {
  return table[makeTileId(pos)];
}

function limitMoves(piece: Piece, moves: Position[], table: Table): Position[] {
  let allowedMoves = [];

  for (const move of moves) {
    const pieceInTheWay = getPieceInTable(move, table);
    if (pieceInTheWay) {
      if (pieceInTheWay.color !== piece.color) {
        allowedMoves.push(move);
      }
      break;
    }
    allowedMoves.push(move);
  }

  return allowedMoves;
}

function rookMoves(piece: Piece, table: Table): Position[] {
  const { x, y } = piece.pos;
  const posFromX = (x: number) => ({ x, y });
  const posFromY = (y: number) => ({ x, y });

  const west = sequence(0, piece.pos.x - 1).map(posFromX);
  const east = sequence(piece.pos.x + 1, 7)
    .map(posFromX)
    .reverse();

  const north = sequence(0, piece.pos.y - 1)
    .map(posFromY)
    .reverse();
  const south = sequence(piece.pos.y + 1, 7).map(posFromY);

  return [west, east, north, south]
    .map((moves) => limitMoves(piece, moves, table))
    .flatMap((i) => i);
}

function isValidPos(pos: Position): boolean {
  const { x, y } = pos;
  return x >= 0 && y >= 0 && x <= 7 && y <= 7;
}

function bishopMoves(piece: Piece, table: Table): Position[] {
  const { x, y } = piece.pos;
  const seq = sequence(1, 7);
  const southEast = seq.map((inc) => ({
    x: x + inc,
    y: y + inc,
  }));

  const southWest = seq.map((inc) => ({
    x: x - inc,
    y: y + inc,
  }));

  const northEast = seq.map((inc) => ({
    x: x + inc,
    y: y - inc,
  }));

  const northWest = seq.map((inc) => ({
    x: x - inc,
    y: y - inc,
  }));

  return [southEast, southWest, northEast, northWest]
    .map((ms) => ms.filter(isValidPos))
    .map((moves) => limitMoves(piece, moves, table))
    .flatMap((i) => i);
}

rookMoves(rook, fromPiecesToTable([rook, pawn])).forEach(selectTile);
