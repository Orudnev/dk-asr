import { getProperty, setProperty } from "./tblSettings";
import { openDatabase } from "./dbTypes";

jest.mock("./dbTypes", () => ({
  openDatabase: jest.fn(),
}));

type TExecuteSqlResult = [
  {
    rowsAffected?: number;
    rows: {
      length: number;
      item: (index: number) => { Content: string };
    };
  }
];

describe("tblSettings", () => {
  const executeSql = jest.fn<Promise<TExecuteSqlResult>, [string, unknown[]?]>();

  beforeEach(() => {
    jest.clearAllMocks();
    (openDatabase as jest.Mock).mockResolvedValue({ executeSql });
  });

  it("setProperty saves the value as JSON", async () => {
    executeSql.mockResolvedValue([
      {
        rowsAffected: 1,
        rows: {
          length: 0,
          item: () => ({ Content: "" }),
        },
      },
    ]);

    const value = { enabled: true, retries: 3 };

    await setProperty("googleDocUrl", value);

    expect(executeSql).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("CREATE TABLE IF NOT EXISTS Settings")
    );
    expect(executeSql).toHaveBeenNthCalledWith(
      2,
      "INSERT OR REPLACE INTO Settings (PropName, Content) VALUES (?, ?)",
      ["googleDocUrl", JSON.stringify(value)]
    );
  });

  it("getProperty returns the value from the database", async () => {
    executeSql
      .mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: () => ({ Content: "" }),
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          rows: {
            length: 1,
            item: () => ({ Content: JSON.stringify("https://example.com") }),
          },
        },
      ]);

    const value = await getProperty<string>("googleDocUrl");

    expect(value).toBe("https://example.com");
    expect(executeSql).toHaveBeenNthCalledWith(
      2,
      "SELECT Content FROM Settings WHERE PropName = ?",
      ["googleDocUrl"]
    );
  });

  it("getProperty returns the default value when the setting is missing", async () => {
    executeSql
      .mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: () => ({ Content: "" }),
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: () => ({ Content: "" }),
          },
        },
      ]);

    const value = await getProperty<string>("googleDocUrl");

    expect(value).toBe("");
  });

  it("getProperty returns the default value when JSON is invalid", async () => {
    executeSql
      .mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: () => ({ Content: "" }),
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          rows: {
            length: 1,
            item: () => ({ Content: "{bad json}" }),
          },
        },
      ]);

    const value = await getProperty<string>("googleDocUrl");

    expect(value).toBe("");
  });
});
