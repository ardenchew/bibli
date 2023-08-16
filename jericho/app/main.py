from fastapi import FastAPI

from sql.book import book_read

app = FastAPI()


@app.get("/health")
async def health():
    return {"message": "OK"}


@app.get("/book/{book_id}")
async def get_book(book_id: int):
    return book_read(book_id)

