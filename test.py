import os
from dotenv import load_dotenv
import openai

## Set the API key from .env file
load_dotenv()
assert "OPENAI_API_KEY" in os.environ, "OPENAI_API_KEY not found in environment variables"
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

MODEL="gpt-4o"

completion = client.chat.completions.create(
  model=MODEL,
  messages=[
    {"role": "system", "content": "You are a helpful assistant that helps me with my math homework!"},
    {"role": "user", "content": "Hello! Could you solve 20 x 5?"}
  ]
)
print("Assistant: " + completion.choices[0].message.content)