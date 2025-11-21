from typing import Tuple, Optional
import json
import re
import time
import random
import google.generativeai as genai
from sqlalchemy.orm import Session
import os
from backend.services import logger
from backend import models, database

STEEPV_CATEGORIES = ["Social", "Technological", "Economic", "Environmental", "Political", "Values"]

def get_gemini_key(db: Session):
    setting = db.query(models.Setting).filter(models.Setting.key == "gemini_api_key").first()
    return setting.value if setting else None

def get_steepv_prompt(db: Session):
    setting = db.query(models.Setting).filter(models.Setting.key == "steepv_prompt").first()
    return setting.value if setting else None

def get_trend_prompt(db: Session):
    setting = db.query(models.Setting).filter(models.Setting.key == "trend_prompt").first()
    return setting.value if setting else None

def get_gemini_model(db: Session):
    setting = db.query(models.Setting).filter(models.Setting.key == "gemini_model").first()
    return setting.value if setting else "gemini-2.0-flash-exp"

def generate_content_with_retry(model, prompt, retries=3, initial_delay=5):
    """
    Generates content with retry logic for 429 errors.
    """
    delay = initial_delay
    for attempt in range(retries):
        try:
            return model.generate_content(prompt)
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "Quota exceeded" in error_str:
                if attempt < retries - 1:
                    sleep_time = delay + random.uniform(0, 1)
                    print(f"Quota exceeded. Retrying in {sleep_time:.2f} seconds... (Attempt {attempt + 1}/{retries})")
                    time.sleep(sleep_time)
                    delay *= 2  # Exponential backoff
                    continue
            raise e

def categorize_article(title: str, summary: str, db: Session = None, industry: str = "", link: str = "") -> Tuple[str, str, str]:
    """
    Categorizes an article into STEEPV and Industry based on content.
    Returns (steepv_category, industry, reasoning).
    """
    # Try Gemini first if DB session is provided
    if db:
        api_key = get_gemini_key(db)
        if api_key:
            try:
                genai.configure(api_key=api_key)
                model_name = get_gemini_model(db)
                model = genai.GenerativeModel(model_name)
                
                custom_prompt = get_steepv_prompt(db)
                
                default_prompt = f"""
                Eres un clasificador experto en señales de futuros usando STEEPV.
                Clasificá la siguiente noticia dentro de una única categoría, eligiendo entre:
                Social, Technological, Economic, Environmental, Political o Values.
                
                Devolvé tu respuesta en exactamente tres objetos JSON separados (uno debajo del otro), sin texto adicional, sin explicaciones fuera del formato, sin comillas ni backticks.
                
                Formato:
                {{
                "category": "[una sola categoría]"
                }}
                {{
                "reason": "[explicación breve de por qué corresponde a esa categoría]"
                }}
                {{
                "industry": "[identificar la industria específica]"
                }}
                
                Noticia: {title} – {summary}
                Industria: {industry}
                Link: {link}
                """
                
                if custom_prompt:
                    prompt = custom_prompt.format(title=title, summary=summary, industry=industry, link=link)
                else:
                    prompt = default_prompt.format(title=title, summary=summary, industry=industry, link=link)
                
                response = generate_content_with_retry(model, prompt)
                text = response.text.strip()
                
                # Clean up markdown code blocks if present
                text = re.sub(r'```json\s*', '', text)
                text = re.sub(r'```\s*', '', text)
                
                # Parse JSON objects
                # The prompt asks for multiple JSON objects, which is tricky to parse directly as a single JSON.
                # We'll try to find them with regex or splitting.
                
                category = "Uncategorized"
                industry = "Unknown"
                reason = ""
                
                try:
                    # Try to parse as a single JSON first if the model was smart enough to combine them or if we change the prompt slightly
                    # But adhering to the user's strict prompt:
                    objects = re.findall(r'\{.*?\}', text, re.DOTALL)
                    for obj_str in objects:
                        try:
                            data = json.loads(obj_str)
                            if "category" in data:
                                category = data["category"]
                            if "reason" in data:
                                reason = data["reason"]
                            if "industry" in data:
                                industry = data["industry"]
                        except:
                            pass
                            
                    return category, industry, reason
                    
                except Exception as e:
                    print(f"JSON Parse Error: {e}")
                    pass

            except Exception as e:
                print(f"Gemini Error: {e}")
                # Fallback to heuristic
    
    # Heuristic Fallback
    text = (title + " " + summary).lower()
    
    # STEEPV Keywords
    steepv_map = {
        "Social": ["society", "people", "culture", "demographic", "education", "health"],
        "Technological": ["ai", "software", "hardware", "digital", "tech", "cyber", "data"],
        "Economic": ["money", "market", "finance", "trade", "economy", "business", "investment"],
        "Environmental": ["climate", "carbon", "nature", "green", "energy", "sustainability"],
        "Political": ["law", "government", "policy", "regulation", "vote", "election"],
        "Values": ["ethics", "moral", "belief", "religion", "trust"]
    }
    
    detected_steepv = "Uncategorized"
    for category, keywords in steepv_map.items():
        if any(k in text for k in keywords):
            detected_steepv = category
            break
            
    # Industry Keywords (Simple heuristic)
    industry_map = {
        "Technology": ["tech", "software", "saas"],
        "Finance": ["bank", "crypto", "stock"],
        "Healthcare": ["health", "med", "pharma"],
        "Energy": ["oil", "gas", "solar", "wind"],
        "Retail": ["shop", "commerce", "store"]
    }
    
    detected_industry = "General"
    for industry, keywords in industry_map.items():
        if any(k in text for k in keywords):
            detected_industry = industry
            break
            
    return detected_steepv, detected_industry, "Heuristic fallback"

def generate_trend_summary(articles: list, db: Session, category: str = None, industry: str = None) -> str:
    """
    Generates a trend summary from a list of articles.
    """
    api_key = get_gemini_key(db)
    if not api_key:
        return "Gemini API Key not configured."

    try:
        genai.configure(api_key=api_key)
        model_name = get_gemini_model(db)
        model = genai.GenerativeModel(model_name)
        
        custom_prompt = get_trend_prompt(db)
        
        # Batch processing to avoid token limits and timeouts
        BATCH_SIZE = 10
        article_batches = [articles[i:i + BATCH_SIZE] for i in range(0, len(articles), BATCH_SIZE)]
        
        batch_summaries = []
        
        logger.log_event(db, "INFO", "AI", f"Generating trend summary for {len(articles)} articles", {"category": category, "industry": industry})
        print(f"Processing {len(articles)} articles in {len(article_batches)} batches...")
        
        for i, batch in enumerate(article_batches):
            print(f"Processing batch {i+1}/{len(article_batches)}...")
            batch_text = "\n\n".join([f"- {a.title}: {a.summary} (Category: {a.steepv_category}, Industry: {a.industry})" for a in batch])
            
            batch_prompt = f"""
            Analyze these news signals and extract the key emerging trends, themes, and signals.
            Focus on STEEPV categories and Industry impacts.
            Provide a concise summary of the key points found in this batch.
            
            News Signals:
            {batch_text}
            """
            
            try:
                response = generate_content_with_retry(model, batch_prompt, retries=3, initial_delay=5)
                batch_summaries.append(response.text)
                # Add a small delay between batches to be nice to the API
                time.sleep(2)
            except Exception as e:
                logger.log_event(db, "ERROR", "AI", f"Error processing batch {i+1} for trend summary", {"error": str(e)})
                print(f"Error processing batch {i+1}: {e}")
                continue
                
        if not batch_summaries:
            logger.log_event(db, "ERROR", "AI", "Failed to generate summary: No batches processed successfully.")
            return "Failed to generate summary: No batches processed successfully."
            
        # Final aggregation
        aggregated_text = "\n\n".join(batch_summaries)
        
        default_final_prompt = f"""
        Act as a Foresight Analyst. You have analyzed several batches of news signals and extracted the following key trends and themes.
        Synthesize these findings into a cohesive Weekly Trend Report.
        
        Group the insights by STEEPV category and Industry where relevant.
        
        Create a narrative summary that explains:
        1. What is happening (The Signal)
        2. Why it matters (The Impact)
        3. How industries are reacting
        
        Format the output as a professional weekly report.
        
        Key Trends & Themes from Batches:
        {aggregated_text}
        """
        
        final_prompt = custom_prompt.format(articles=aggregated_text) if custom_prompt else default_final_prompt
        
        if category:
            final_prompt += f"\n\nFocus specifically on trends within the '{category}' STEEPV category."
        if industry:
            final_prompt += f"\n\nFocus specifically on impacts to the '{industry}' industry."
        
        # Increase retries and delay for final summary
        try:
            response = generate_content_with_retry(model, final_prompt, retries=5, initial_delay=10)
            logger.log_event(db, "INFO", "AI", "Trend summary generated successfully")
            return response.text
        except Exception as e:
            logger.log_event(db, "ERROR", "AI", "Error generating final trend summary", {"error": str(e)})
            raise e
    except Exception as e:
        return f"Error generating summary: {e}"
