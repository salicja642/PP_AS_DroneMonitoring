import sqlite3

conn = sqlite3.connect('drone_missions.db')
c = conn.cursor()

c.execute("DELETE FROM history WHERE route_json = '[]'")

print(f"Usunięto rekordów: {conn.total_changes}")

conn.commit()
conn.close()