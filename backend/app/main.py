from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded game data
DAILY_GAME = {
    # "options": [
    #     "😀", "😂", "🤣", "😊", "🥰",
    #     "😎", "🤔", "🤯", "😴", "🥳",
    #     "🤠", "👻", "👽", "🤖", "🎃",
    #     "👾", "🤡", "🐶", "🐱", "🐭",
    #     "🐼", "🐸", "🦊", "🦁", "🐯"
    # ],
    "options": [
        "🚳", "🚥", "🐶", "💎", "🥲",
        "🌞", "🫤", "💟", "🥮", "🫡",
        "🌇", "🅿", "🍮", "🌻", "🧷",
        "🍴", "🪪", "🌩", "5⃣", "✈",
        "🎴", "🌄", "☪", "🥝", "😼"
    ],
    "answer": ["🚳", "🐶", "💎", "🥲"]  # Example answer
}

@app.get("/")
async def read_root():
    return {"status": "online"}

@app.get("/api/game/daily")
async def get_daily_game():
    return {
        "options": DAILY_GAME["options"],
        "answer": DAILY_GAME["answer"],
        "required_count": len(DAILY_GAME["answer"])
    }

@app.get("/api/game/emojis")
async def get_emojis():
    return {"emojis": DAILY_GAME["options"]}