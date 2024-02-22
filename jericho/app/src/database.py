from alembic import command
from alembic.config import Config
from sqlmodel import Session, SQLModel, create_engine

from src.config import pg_host, pg_password, pg_user, alembic_dir

from src.db.schema import *


def get_session():
    with Session(engine) as session:
        yield session


# TODO(arden) use Alembic migrations.
def create_db_and_tables():
    alembic_config = Config(alembic_dir + '.ini')
    alembic_config.set_main_option('sqlalchemy.url', pg_url)
    alembic_config.set_main_option('script_location', alembic_dir)
    command.upgrade(alembic_config, "head")


pg_url = f"postgresql://{pg_user}:{pg_password}@{pg_host}:5432/jericho"
engine = create_engine(pg_url, echo=True)
