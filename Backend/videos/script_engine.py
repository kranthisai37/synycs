import random
import re
import urllib.parse
import requests
import json

class ScriptEngine:
    def __init__(self):
        pass
        
    def _get_pollinations_url(self, prompt):
        safe_prompt = prompt[:180]
        sanitized_prompt = re.sub(r'[:()/\\\[\]]', ' ', safe_prompt)
        sanitized_prompt = re.sub(r'\s+', ' ', sanitized_prompt).strip()
        encoded_prompt = urllib.parse.quote(sanitized_prompt)
        seed = random.randint(1, 1000000)
        return f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&private=true&model=flux&seed={seed}"

        
    def extract_keywords_from_text(self, text, topic):
        # Strip structural prefixes (e.g. "SHORT DESCRIPTION:", "TITLE:")
        clean_text = re.sub(r'^(title|description|short description|summary|section\s+\d+|slide\s+\d+):', '', text, flags=re.IGNORECASE)
        
        stop_words = {
            'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
            'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
            'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
            'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
            'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
            'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
            'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
            'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
            'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
            'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres',
            'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
            'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
            'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
            'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
            'your', 'yours', 'yourself', 'yourselves', 'please', 'provide', 'topic', 'notes', 'generate',
            'content', 'ultimate', 'guide', 'essential', 'exploration', 'examining', 'structural', 'foundations',
            'realworld', 'utility', 'modern', 'science', 'technology', 'represents', 'revolutionary', 'paradigm',
            'intelligence', 'functions', 'organizing', 'complex', 'systemic', 'nodes', 'optimize', 'processing',
            'throughput', 'intricate', 'design', 'challenges', 'combining', 'historical', 'foundational',
            'theories', 'adaptive', 'frameworks', 'bridges', 'computational', 'potential', 'practical',
            'humancentric', 'problem', 'solving',
            # Structural / Formatting Ignores
            'title', 'description', 'short', 'introduction', 'intro', 'summary', 'section', 'overview',
            'key', 'points', 'point', 'advantages', 'disadvantages', 'examples', 'risks', 'challenges',
            'conclusion', 'concluding', 'features', 'applications', 'uses', 'detail', 'detailed', 'explanation',
            'chapter', 'slide', 'essential', 'exploration', 'examining', 'understanding', 'learning', 'education',
            'study', 'science', 'concept', 'concepts', 'theory', 'theories', 'system', 'process', 'method',
            'methods', 'important', 'various', 'different', 'primary', 'secondary', 'general', 'specific',
            'highly', 'really', 'extremely', 'basic', 'advanced', 'simple', 'complex', 'modern', 'traditional',
            'paragraph', 'sentence', 'text', 'words', 'word', 'page', 'video', 'project', 'image', 'picture'
        }
        
        words = re.findall(r'\b[a-zA-Z]{4,15}\b', clean_text.lower())
        keywords = [w for w in words if w not in stop_words]
        
        # Extract keywords from topic
        topic_words = re.findall(r'\b[a-zA-Z]{4,15}\b', topic.lower())
        topic_keywords = [w for w in topic_words if w not in stop_words]
        
        all_keywords = list(set(keywords + topic_keywords))
        all_keywords.sort(key=len, reverse=True)
        return all_keywords[:1]


    def generate(self, topic, directors_notes=""):
        topic = topic.strip()
        if not topic:
            return "Please provide a topic or notes to generate content.", []

        # System prompt for high-fidelity NotebookLM Style Podcast Deep Dive Generation
        system_prompt = (
            "You are a world-class AI script and presentation creator specialized in 'NotebookLM Style Deep Dives'. "
            "Write a comprehensive, engaging, and structured educational script about the user's topic. "
            "The script must consist of exactly 4 logically sequenced slides/paragraphs representing a deep dive. "
            "For each slide, you must also generate a highly specific visual prompt describing a stunning, professional cinematic educational visual to display behind the host (without any text). "
            "Write your response in strict, standard JSON format with exactly this structure (no markdown wrappers outside the JSON itself):\n"
            "{\n"
            "  \"title\": \"Deep Dive: The Ultimate Guide to [Topic]\",\n"
            "  \"slides\": [\n"
            "    {\n"
            "      \"title\": \"Sub-Topic Title\",\n"
            "      \"text\": \"A rich educational paragraph of 3-4 sentences written in a highly engaging, conversational NotebookLM podcast host style.\",\n"
            "      \"visual_prompt\": \"A detailed, high-quality, cinematic visual scene description matching this slide's context (e.g. A gorgeous close-up of a futuristic laptop showing Python code, soft glowing blue neon light, 16:9, cinematic).\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        user_prompt = f"Topic: {topic}\nDirectors Notes: {directors_notes}"

        # 1. Call Pollinations AI Text Completion
        try:
            url = "https://text.pollinations.ai/"
            payload = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "model": "openai"
            }
            response = requests.post(url, json=payload, timeout=20)
            if response.status_code == 200:
                response_text = response.text.strip()
                # Clean up markdown JSON wrapper if present
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()
                
                parsed_data = json.loads(response_text)
                
                title = parsed_data.get("title", f"Deep Dive: {topic}")
                slides_data = parsed_data.get("slides", [])
                
                if slides_data:
                    full_content = f"TITLE: {title}\n\n"
                    slides = []
                    current_time = 0
                    
                    for i, s in enumerate(slides_data):
                        slide_title = s.get("title", f"Section {i+1}")
                        slide_text = s.get("text", "")
                        visual_prompt = s.get("visual_prompt", f"An educational slide showing {slide_title}")
                        
                        full_content += f"{slide_title.upper()}:\n{slide_text}\n\n"
                        
                        duration = max(8, min(25, len(slide_text) // 15))
                        
                        image_url = self._get_pollinations_url(visual_prompt)
                        
                        slides.append({
                            "id": i + 1,
                            "text": slide_text,
                            "duration": duration,
                            "startTime": current_time,
                            "type": "IMAGE" if i % 2 == 0 else "DRAWING",
                            "visualPrompt": visual_prompt,
                            "imageUrl": image_url
                        })
                        current_time += duration
                        
                    return full_content.strip(), slides
        except Exception as e:
            print(f"DEBUG: AI generation failed, falling back: {e}")

        # 2. Rock-solid structured fallback if API fails or returns invalid format
        title = f"Deep Dive: The Ultimate Guide to {topic}"
        short_desc = (
            f"An essential exploration of {topic}, examining its structural foundations, "
            f"real-world utility, and key industry applications in modern science and technology."
        )
        detailed_exp = (
            f"{topic} represents a revolutionary paradigm in modern intelligence. At its core, "
            f"it functions by organizing complex systemic nodes to optimize processing throughput and "
            f"solve intricate design challenges. By combining historical foundational theories with modern "
            f"adaptive frameworks, {topic} bridges the gap between raw computational potential and "
            f"practical human-centric problem solving."
        )
        conclusion = (
            f"In conclusion, mastering the key tenets of {topic} unlocks unmatched potential for innovation. "
            f"As we look towards a future driven by computational excellence, this paradigm will remain "
            f"indispensable to designers, developers, and researchers worldwide."
        )

        full_content = (
            f"TITLE: {title}\n\n"
            f"SHORT DESCRIPTION:\n{short_desc}\n\n"
            f"DETAILED EXPLANATION:\n{detailed_exp}\n\n"
            f"FUTURE HORIZONS & CONCLUSION:\n{conclusion}"
        )

        sections_titles = [
            "Title & Introduction",
            "Short Description",
            "Detailed Explanation",
            "Future Horizons & Conclusion"
        ]

        sections_contents = [
            f"TITLE: {title}",
            f"SHORT DESCRIPTION:\n{short_desc}",
            f"DETAILED EXPLANATION:\n{detailed_exp}",
            f"FUTURE HORIZONS & CONCLUSION:\n{conclusion}"
        ]

        slides = []
        current_time = 0
        durations = [10, 15, 20, 18]

        for i, slide_title in enumerate(sections_titles):
            duration = durations[i]
            content_text = sections_contents[i]
            
            visual_prompt = f"Educational slide for {topic}: {slide_title}"
            image_url = self._get_pollinations_url(visual_prompt)

            slides.append({
                "id": i + 1,
                "text": content_text,
                "duration": duration,
                "startTime": current_time,
                "type": "IMAGE" if i % 2 == 0 else "DRAWING",
                "visualPrompt": visual_prompt,
                "imageUrl": image_url
            })
            current_time += duration
            
        return full_content, slides
