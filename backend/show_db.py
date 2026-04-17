import sqlite3

conn = sqlite3.connect('asas.db')
c = conn.cursor()

# Get tables
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()

for t in tables:
    name = t[0]
    print(f"\n{'='*50}")
    print(f"  TABLE: {name}")
    print(f"{'='*50}")
    cols = c.execute(f"PRAGMA table_info({name})").fetchall()
    for col in cols:
        pk = " [PK]" if col[5] else ""
        nn = " NOT NULL" if col[3] else ""
        default = f" DEFAULT={col[4]}" if col[4] else ""
        print(f"  {col[1]:30s} {col[2]:15s}{pk}{nn}{default}")

    # Show row count
    count = c.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]
    print(f"\n  Rows: {count}")

    # Show sample data if any
    if count > 0:
        rows = c.execute(f"SELECT * FROM {name} LIMIT 3").fetchall()
        print(f"  Sample data:")
        for row in rows:
            print(f"    {row}")

conn.close()
