from fastapi import FastAPI
from fastapi.responses import Response
import functools
import io
import yaml

from src.database import create_db_and_tables
from src.routers import books, internal, users

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# additional yaml version of openapi.json
@app.get('/openapi.yaml', include_in_schema=False)
@functools.lru_cache()
def read_openapi_yaml() -> Response:
    openapi_json = app.openapi()
    yaml_s = io.StringIO()
    yaml.dump(openapi_json, yaml_s)
    return Response(yaml_s.getvalue(), media_type='text/yaml')


app.include_router(books.router)
app.include_router(internal.router)
app.include_router(users.user_router)
app.include_router(users.users_router)
