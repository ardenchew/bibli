import psycopg2 as pg

pg_host: str = "localhost"
pg_database: str = "jericho"
pg_user: str = "postgres"
pg_password: str = "admin"
pg_port: int = 5432

pg_url: str = f"postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_database}"


def connect():
    """ Connect to the PostgreSQL database server """
    conn = None
    try:
        conn = pg.connect(pg_url)

        cur = conn.cursor()

        print("PostgreSQL database version:")
        cur.execute("SELECT version()")

        db_version = cur.fetchone()
        print(db_version)

        cur.close()

    except (Exception, pg.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")


if __name__ == '__main__':
    connect()
