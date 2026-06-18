export function printObjectArray(objArray: any[]) {
  console.log("printObjectArray:");

  if (!Array.isArray(objArray)) {
    console.log("input is not an array");
    return;
  }

  if (objArray.length === 0) {
    console.log("[]");
    return;
  }

  const columns = Array.from(
    new Set(
      objArray.flatMap((item) =>
        item && typeof item === "object" ? Object.keys(item) : []
      )
    )
  );

  if (columns.length === 0) {
    console.log("array contains no object properties");
    return;
  }

  const stringifyCell = (value: unknown) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const widths = columns.map((column) => {
    const cellWidth = Math.max(
      ...objArray.map((item) => stringifyCell(item?.[column]).length)
    );
    return Math.max(column.length, cellWidth);
  });

  const pad = (value: string, width: number) => value.padEnd(width, " ");

  const header = columns
    .map((column, index) => pad(column, widths[index]))
    .join(" | ");

  const separator = widths
    .map((width) => "-".repeat(width))
    .join("-+-");

  console.log(header);
  console.log(separator);

  for (const item of objArray) {
    const row = columns
      .map((column, index) => pad(stringifyCell(item?.[column]), widths[index]))
      .join(" | ");
    console.log(row);
  }
}
