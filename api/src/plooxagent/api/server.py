from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/call")
async def call():
    return {"url": "https://tooploox-hackathon.daily.co/test_room"}
