pg_host: str = "localhost"
pg_database: str = "jericho"
pg_user: str = "postgres"
pg_password: str = "admin"
pg_port: int = 5432

pg_url: str = f"postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_database}"
