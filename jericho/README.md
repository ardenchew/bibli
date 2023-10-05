# jericho

jericho is the central server for book metadata and review information

### stack

- Server language: Python 3
  - Package management: [Poetry](https://python-poetry.org/)
  - Framework: [FastAPI](https://fastapi.tiangolo.com/)
  - ORM: [SQLModel (SQLAlchemy + Pydantic)](https://sqlmodel.tiangolo.com/)
  - Migrations: [Alembic](https://alembic.sqlalchemy.org/en/latest/)
- Relational database: PostgreSQL 15

## Setup

The following setup assumes you're using MacOS and have Homebrew installed.

1. Add the bash.env script at the root of the project to your shell rc (.zshrc or .bashrc).
   This will set the `$BIBLI` environment variable to the root of your project. All future steps assume this is set.

```sh
$ echo "source /path/to/bibli/env.bash" >> ~/.zshrc
$ source ~/.zshrc
```

2. Ensure you have python 3.11 installed:

```sh
$ python3 --version
Python 3.11.5

# If the above version is lower than 3.11, install using homebrew:
$ brew install python@3.11
$ brew link python@3.11
```

3. Install and run PostgreSQL 15:

```sh
# Install postgresql 15.
$ brew install postgresql@15
# Run postgres in the background (only need to run once, this will run on all subsequent startups).
$ brew services start postgresql@15
```

4. Install Poetry and use it to install Python dependencies:

```sh
$ brew install poetry

$ cd $BIBLI/jericho/app
$ poetry install
```

5. Setup Postgres:

```sh
# Create the postgres user.
$ createuser -s postgres
# Create the jericho db.
$ createdb jericho
```

6. Run the app:

```sh
$ source $BIBLI/jericho/env.bash
$ start-server
```

On first startup, the database schema will be created for you
in the `jericho` database by SQLAlchemy. You can confirm this with `psql`:

```sh
$ psql -U postgres jericho
psql (15.4 (Homebrew))
Type "help" for help.

jericho=# \dt
               List of relations
 Schema |        Name        | Type  |  Owner
--------+--------------------+-------+----------
...
(9 rows)
```
