import requests
import json

def test_generate_script(notes, label):
    print(f"\n--- Testing Script Generation for: {label} ---")
    url = "http://127.0.0.1:8000/api/videos/generate_script/"
    payload = {"notes": notes}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print(f"Script Preview: {data['script'][:200]}...")
        print(f"Slide 2 Title: {data['slides'][1]['text']}")
        print(f"Slide 2 Visual Prompt: {data['slides'][1]['visualPrompt'][:100]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    notes_1 = "Python is a high-level, interpreted programming language. It is known for its simple syntax and readability. Python supports multiple programming paradigms, including structured, object-oriented, and functional programming. It is widely used in data science, artificial intelligence, and web development."
    notes_2 = "The Great Wall of China is a series of fortifications built along the historical northern borders of ancient Chinese states. It was constructed to protect against nomadic groups from the Eurasian Steppe. The wall is over 13,000 miles long and is one of the most impressive architectural feats in history."
    
    test_generate_script(notes_1, "Python Programming")
    test_generate_script(notes_2, "Great Wall of China")
