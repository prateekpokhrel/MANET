from fastapi import FastAPI

app = FastAPI(
    title="MANET AI Service",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "service": "MANET AI Service",
        "status": "running"
    }