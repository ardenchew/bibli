# postgres_user: str = os.environ.get("POSTGRES_USER")
# postgres_password: str = os.environ.get("POSTGRES_PASSWORD")
# postgres_server: str = os.environ.get("POSTGRES_SERVER")
# postgres_port: int = int(os.environ.get("POSTGRES_PORT"))
# postgres_db: str = os.environ.get("POSTGRES_DB")
# db_echo_log: bool = True if os.environ.get("DEBUG") == "True" else False
#
# @property
# def sync_database_url(self) -> str:
#     return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_server}:{self.postgres_port}/{self.postgres_db}"