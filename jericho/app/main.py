from fastapi import FastAPI
from src.database import create_db_and_tables
from src.routers import books, internal, users

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


app.include_router(books.router)
app.include_router(internal.router)
app.include_router(users.user_router)
