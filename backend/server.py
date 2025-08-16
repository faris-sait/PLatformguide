import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="SaaS Scout API", description="Compare pricing of popular SaaS providers")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ServiceTier(BaseModel):
    name: str
    price: str
    features: List[str]

class SaasService(BaseModel):
    id: str
    name: str
    category: str
    description: str
    tiers: List[ServiceTier]
    advantages: List[str]
    disadvantages: List[str]
    link: str
    logo_url: Optional[str] = None

# Enhanced SaaS dataset with accurate pricing tiers in INR and verified URLs
SAAS_SERVICES = [
    # Hosting Platforms - Enhanced with Heroku and AWS
    {
        "id": "render",
        "name": "Render",
        "category": "Hosting",
        "description": "Cloud platform for static sites, web services, and databases",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["750 hours/month", "Free static sites", "15 min idle timeout"]},
            {"name": "Starter", "price": "₹525/month", "features": ["2 GB RAM", "100 GB bandwidth", "Always-on service"]},
            {"name": "Standard", "price": "₹1,875/month", "features": ["4 GB RAM", "200 GB bandwidth", "Priority support"]},
            {"name": "Pro", "price": "Custom", "features": ["Custom resources", "Dedicated support", "Enterprise features"]}
        ],
        "advantages": ["Easy deployment", "Free tier available", "Auto SSL certificates", "Git integration"],
        "disadvantages": ["Cold starts on free tier", "Limited regions", "Higher costs for high traffic"],
        "link": "https://render.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/render.svg"
    },
    {
        "id": "vercel",
        "name": "Vercel", 
        "category": "Hosting",
        "description": "Frontend cloud platform optimized for Next.js and React",
        "tiers": [
            {"name": "Hobby", "price": "₹0/month", "features": ["Unlimited websites", "100 GB bandwidth", "1,000 build minutes"]},
            {"name": "Pro", "price": "₹1,500/user/month", "features": ["1 TB bandwidth", "10,000 build minutes", "Team collaboration"]},
            {"name": "Enterprise", "price": "Custom", "features": ["Unlimited bandwidth", "Advanced security", "Priority support"]}
        ],
        "advantages": ["Fast global CDN", "Perfect for Next.js", "Excellent DX", "Edge functions"],
        "disadvantages": ["Higher costs for bandwidth", "Limited backend options", "Function timeout limits"],
        "link": "https://vercel.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vercel.svg"
    },
    {
        "id": "netlify",
        "name": "Netlify",
        "category": "Hosting", 
        "description": "All-in-one platform for web development and deployment",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["100 GB bandwidth", "1 GB storage", "50 build minutes"]},
            {"name": "Basic", "price": "₹675/site/month", "features": ["50 GB bandwidth", "5 GB storage", "100 build minutes"]},
            {"name": "Advanced", "price": "₹2,175/site/month", "features": ["100 GB bandwidth", "25 GB storage", "350 build minutes"]},
            {"name": "Pro", "price": "₹3,675/site/month", "features": ["1 TB bandwidth", "100 GB storage", "600 build minutes"]}
        ],
        "advantages": ["Generous free tier", "Form handling", "Split testing", "Branch deploys"],
        "disadvantages": ["Build minute limits", "Pricing per site", "Function limitations"],
        "link": "https://www.netlify.com/pricing/",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/netlify.svg"
    },
    {
        "id": "railway",
        "name": "Railway",
        "category": "Hosting",
        "description": "Infrastructure platform for deploying and scaling applications",
        "tiers": [
            {"name": "Hobby", "price": "₹375/month", "features": ["₹375 usage credit", "500 GB transfer", "Shared CPU"]},
            {"name": "Pro", "price": "₹1,500/member/month", "features": ["₹750 usage credit", "Priority builds", "Team features"]},
            {"name": "Resource Usage", "price": "₹750/vCPU/month", "features": ["Pay per resource", "₹750/GB memory", "₹7.50/GB transfer"]}
        ],
        "advantages": ["Simple deployment", "Database included", "Resource-based pricing", "Docker support"],
        "disadvantages": ["No free tier", "Usage-based billing", "Limited documentation"],
        "link": "https://railway.app/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/railway.svg"
    },
    {
        "id": "flyio",
        "name": "Fly.io",
        "category": "Hosting",
        "description": "Global application platform with edge deployment",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["3 shared VMs", "1 GB memory", "1 CPU core"]},
            {"name": "Paid", "price": "₹145/VM/month", "features": ["Additional VMs", "Custom resources", "Global deployment"]},
            {"name": "Enterprise", "price": "Custom", "features": ["Dedicated support", "SLA guarantees", "Custom regions"]}
        ],
        "advantages": ["Global edge deployment", "Docker native", "Low latency", "Pay per resource"],
        "disadvantages": ["Complex pricing", "Learning curve", "Limited free tier"],
        "link": "https://fly.io/plans",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/fly.svg"
    },
    {
        "id": "heroku",
        "name": "Heroku",
        "category": "Hosting",
        "description": "Platform as a Service (PaaS) with easy deployment and scaling",
        "tiers": [
            {"name": "Eco", "price": "₹415/month", "features": ["1,000 dyno hours", "Sleeps after 30 min", "Shared resources"]},
            {"name": "Basic", "price": "₹581/month", "features": ["Always-on dynos", "Up to 10 process types", "Basic metrics"]},
            {"name": "Standard", "price": "₹2,075/month", "features": ["Better performance", "Autoscaling", "Enhanced metrics"]},
            {"name": "Performance", "price": "₹20,750/month", "features": ["Dedicated resources", "Advanced metrics", "Enterprise features"]}
        ],
        "advantages": ["Easy to use", "Great for beginners", "Add-on ecosystem", "Git-based deployment"],
        "disadvantages": ["Can be expensive", "Vendor lock-in", "Limited customization", "Cold starts on lower tiers"],
        "link": "https://www.heroku.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/heroku.svg"
    },
    {
        "id": "aws",
        "name": "AWS (Amazon Web Services)",
        "category": "Hosting",
        "description": "Comprehensive cloud computing platform with extensive services",
        "tiers": [
            {"name": "Free Tier", "price": "₹0/month", "features": ["12 months free", "750 hours EC2 t2.micro", "Limited services"]},
            {"name": "t2.micro", "price": "₹79/month", "features": ["1 vCPU", "1 GB RAM", "EBS-optimized"]},
            {"name": "t3.medium", "price": "₹2,490/month", "features": ["2 vCPUs", "4 GB RAM", "Up to 5 Gbps network"]},
            {"name": "Enterprise", "price": "Custom", "features": ["Dedicated support", "Custom configurations", "Volume discounts"]}
        ],
        "advantages": ["Most comprehensive", "Global presence", "Enterprise-grade", "Extensive services"],
        "disadvantages": ["Complex pricing", "Steep learning curve", "Can be expensive", "Over-engineering risk"],
        "link": "https://aws.amazon.com/pricing/",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonaws.svg"
    },

    # LLM/AI Services
    {
        "id": "openai",
        "name": "OpenAI",
        "category": "LLM/AI",
        "description": "Advanced AI models including GPT and image generation",
        "tiers": [
            {"name": "GPT-5 Nano", "price": "₹4.15/M input tokens", "features": ["₹33.20/M output", "Fastest response", "Cost optimized"]},
            {"name": "GPT-5 Mini", "price": "₹20.75/M input tokens", "features": ["₹166/M output", "Balanced performance", "Good for most tasks"]},
            {"name": "GPT-5", "price": "₹103.75/M input tokens", "features": ["₹830/M output", "Most capable", "Complex reasoning"]}
        ],
        "advantages": ["State-of-the-art models", "Wide API coverage", "Extensive documentation", "Fast inference"],
        "disadvantages": ["Higher costs", "Rate limits", "Content policies", "Token-based pricing"],
        "link": "https://openai.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg"
    },
    {
        "id": "anthropic", 
        "name": "Anthropic",
        "category": "LLM/AI",
        "description": "Claude AI models focused on safety and helpfulness",
        "tiers": [
            {"name": "Claude 3.5 Haiku", "price": "₹66.40/M input tokens", "features": ["₹332/M output", "Fast & efficient", "Good for simple tasks"]},
            {"name": "Claude Sonnet 4", "price": "₹249/M input tokens", "features": ["₹1,245/M output", "Balanced model", "Most popular choice"]},
            {"name": "Claude Opus 4", "price": "₹1,245/M input tokens", "features": ["₹6,225/M output", "Most capable", "Complex reasoning"]}
        ],
        "advantages": ["Safety focused", "Long context window", "Good reasoning", "Constitutional AI"],
        "disadvantages": ["Higher pricing", "Limited availability", "Newer ecosystem", "Less tooling"],
        "link": "https://www.anthropic.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/anthropic.svg"
    },
    {
        "id": "google-ai",
        "name": "Google AI (Gemini)",
        "category": "LLM/AI", 
        "description": "Google's multimodal AI models with vision capabilities",
        "tiers": [
            {"name": "Gemini 2.5 Flash-Lite", "price": "₹8.30/M input tokens", "features": ["₹33.20/M output", "Ultra fast", "Basic tasks"]},
            {"name": "Gemini 2.5 Flash", "price": "₹24.90/M input tokens", "features": ["₹207.50/M output", "Fast & capable", "Most versatile"]},
            {"name": "Gemini 2.5 Pro", "price": "₹103.75/M input tokens", "features": ["₹830/M output", "Most advanced", "Complex tasks"]}
        ],
        "advantages": ["Multimodal capabilities", "Competitive pricing", "Google ecosystem", "Vision features"],
        "disadvantages": ["Newer platform", "Limited availability", "Documentation gaps", "Regional restrictions"],
        "link": "https://cloud.google.com/vertex-ai/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg"
    },
    {
        "id": "replicate",
        "name": "Replicate",
        "category": "LLM/AI",
        "description": "Platform for running open-source AI models",
        "tiers": [
            {"name": "Pay-per-use", "price": "₹0.01-1/prediction", "features": ["Open source models", "No monthly fees", "Compute-based pricing"]},
            {"name": "Pro", "price": "₹1,660/month", "features": ["Dedicated capacity", "Faster startup", "Priority support"]},
            {"name": "Enterprise", "price": "Custom", "features": ["Private deployments", "SLA guarantees", "Custom models"]}
        ],
        "advantages": ["Open source models", "Pay per use", "No lock-in", "Community driven"],
        "disadvantages": ["Variable performance", "Cold starts", "Limited support", "Compute costs"],
        "link": "https://replicate.com/pricing",
        "logo_url": "https://replicate.com/favicon.ico"
    },

    # Database Services
    {
        "id": "mongodb-atlas",
        "name": "MongoDB Atlas",
        "category": "Database",
        "description": "Fully managed MongoDB database service",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["512 MB storage", "Shared clusters", "Basic monitoring"]},
            {"name": "Dedicated", "price": "₹4,650/month", "features": ["2 GB RAM", "10 GB storage", "Dedicated clusters"]},
            {"name": "Dedicated (Large)", "price": "₹24,900/month", "features": ["8 GB RAM", "40 GB storage", "High performance"]},
            {"name": "Enterprise", "price": "Custom", "features": ["Advanced security", "Multi-region", "24/7 support"]}
        ],
        "advantages": ["Managed service", "Global clusters", "Built-in security", "Easy scaling"],
        "disadvantages": ["Can be expensive", "Vendor lock-in", "Complex pricing", "Network charges"],
        "link": "https://www.mongodb.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mongodb.svg"
    },
    {
        "id": "planetscale",
        "name": "PlanetScale", 
        "category": "Database",
        "description": "Serverless MySQL platform with branching",
        "tiers": [
            {"name": "Scaler", "price": "₹3,250/month", "features": ["5 GB storage", "1 billion reads", "10 million writes"]},
            {"name": "Scaler Pro", "price": "₹6,500/month", "features": ["25 GB storage", "10 billion reads", "100 million writes"]},
            {"name": "Enterprise", "price": "Custom", "features": ["Custom limits", "SLA guarantees", "Advanced features"]}
        ],
        "advantages": ["Database branching", "Serverless scaling", "Zero downtime schema changes", "MySQL compatible"],
        "disadvantages": ["No free tier", "MySQL only", "Learning curve", "Relatively new"],
        "link": "https://planetscale.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/planetscale.svg"
    },
    {
        "id": "supabase",
        "name": "Supabase",
        "category": "Database",
        "description": "Open source Firebase alternative with PostgreSQL",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["500 MB database", "50 MB file storage", "50,000 monthly active users"]},
            {"name": "Pro", "price": "₹2,080/month", "features": ["8 GB database", "100 GB file storage", "100,000 monthly active users"]},
            {"name": "Team", "price": "₹2,080/member/month", "features": ["Pro features", "Team collaboration", "Read replicas"]},
            {"name": "Enterprise", "price": "Custom", "features": ["SLA guarantees", "Advanced security", "Priority support"]}
        ],
        "advantages": ["Open source", "Real-time features", "Auth built-in", "PostgreSQL based"],
        "disadvantages": ["Smaller ecosystem", "Limited regions", "Newer platform", "PostgreSQL only"],
        "link": "https://supabase.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/supabase.svg"
    },

    # Email Services
    {
        "id": "sendgrid",
        "name": "SendGrid",
        "category": "Email",
        "description": "Email delivery and marketing platform",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["100 emails/day", "Basic analytics", "Email API"]},
            {"name": "Essentials", "price": "₹1,660/month", "features": ["50,000 emails", "Email validation", "24/7 support"]},
            {"name": "Pro", "price": "₹7,500/month", "features": ["100,000 emails", "Advanced analytics", "A/B testing"]},
            {"name": "Premier", "price": "Custom", "features": ["High volume", "Dedicated IP", "Custom integrations"]}
        ],
        "advantages": ["High deliverability", "Comprehensive APIs", "Marketing tools", "Reliable service"],
        "disadvantages": ["Can be expensive", "Complex pricing", "Learning curve", "Support quality varies"],
        "link": "https://sendgrid.com/pricing/",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sendgrid.svg"
    },
    {
        "id": "mailgun",
        "name": "Mailgun",
        "category": "Email",
        "description": "Email API service for developers",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["100 emails/day", "Basic tracking", "API access"]},
            {"name": "Foundation", "price": "₹1,250/month", "features": ["10,000 emails", "Email validation", "Analytics"]},
            {"name": "Growth", "price": "₹2,900/month", "features": ["50,000 emails", "Advanced tracking", "Webhooks"]},
            {"name": "Scale", "price": "₹7,500/month", "features": ["100,000 emails", "Dedicated IP", "Priority support"]}
        ],
        "advantages": ["Developer focused", "Good documentation", "Flexible API", "EU/US regions"],
        "disadvantages": ["Limited templates", "No marketing tools", "Technical setup", "Support response time"],
        "link": "https://www.mailgun.com/pricing/",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailgun.svg"
    },
    {
        "id": "resend",
        "name": "Resend",
        "category": "Email",
        "description": "Modern email API for developers",
        "tiers": [
            {"name": "Free", "price": "₹0/month", "features": ["3,000 emails/month", "1 domain", "Email API"]},
            {"name": "Pro", "price": "₹1,660/month", "features": ["50,000 emails", "Custom domains", "Analytics"]},
            {"name": "Business", "price": "₹3,320/month", "features": ["100,000 emails", "Team features", "Webhooks"]},
            {"name": "Enterprise", "price": "Custom", "features": ["Custom volume", "Dedicated support", "SLA"]}
        ],
        "advantages": ["Modern developer experience", "Great documentation", "Simple pricing", "React email integration"],
        "disadvantages": ["Newer service", "Limited features", "Small market share", "No marketing tools"],
        "link": "https://resend.com/pricing",
        "logo_url": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/resend.svg"
    }
]

@app.get("/")
async def root():
    return {"message": "SaaS Scout API - Compare pricing of popular SaaS providers", "version": "2.0", "services_count": len(SAAS_SERVICES)}

@app.get("/api/services", response_model=List[SaasService])
async def get_services(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "name",
    sort_order: Optional[str] = "asc"
):
    """
    Get all SaaS services with optional filtering and sorting
    """
    services = SAAS_SERVICES.copy()
    
    # Filter by category
    if category and category.lower() != "all":
        services = [s for s in services if s["category"].lower() == category.lower()]
    
    # Search filter
    if search:
        search_lower = search.lower()
        services = [
            s for s in services 
            if search_lower in s["name"].lower() 
            or search_lower in s["description"].lower()
            or any(search_lower in advantage.lower() for advantage in s["advantages"])
        ]
    
    # Sorting
    if sort_by == "name":
        services.sort(key=lambda x: x["name"].lower(), reverse=(sort_order == "desc"))
    elif sort_by == "category":
        services.sort(key=lambda x: x["category"].lower(), reverse=(sort_order == "desc"))
    elif sort_by == "price":
        # Sort by the first tier price (convert INR to numeric for sorting)
        def extract_price(service):
            first_tier_price = service["tiers"][0]["price"]
            if "₹0" in first_tier_price or "Free" in first_tier_price:
                return 0
            elif "Custom" in first_tier_price:
                return 999999  # Put custom pricing at the end
            else:
                # Extract numeric value from price string
                import re
                numbers = re.findall(r'[\d,]+', first_tier_price.replace(',', ''))
                return int(numbers[0]) if numbers else 999999
        
        services.sort(key=extract_price, reverse=(sort_order == "desc"))
    
    return services

@app.get("/api/services/{service_id}", response_model=SaasService)
async def get_service(service_id: str):
    """
    Get a specific service by ID
    """
    service = next((s for s in SAAS_SERVICES if s["id"] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@app.get("/api/categories")
async def get_categories():
    """
    Get all available categories
    """
    categories = list(set(service["category"] for service in SAAS_SERVICES))
    return {"categories": sorted(categories)}

@app.get("/api/cheapest")
async def get_cheapest_by_category():
    """
    Get the cheapest service in each category
    """
    from collections import defaultdict
    
    cheapest_by_category = defaultdict(lambda: {"service": None, "price": float('inf')})
    
    for service in SAAS_SERVICES:
        category = service["category"]
        first_tier = service["tiers"][0]
        
        # Extract numeric price
        price_str = first_tier["price"]
        if "₹0" in price_str or "Free" in price_str:
            price = 0
        elif "Custom" in price_str:
            continue  # Skip custom pricing
        else:
            import re
            numbers = re.findall(r'[\d,]+', price_str.replace(',', ''))
            price = int(numbers[0]) if numbers else float('inf')
        
        if price < cheapest_by_category[category]["price"]:
            cheapest_by_category[category] = {
                "service": service,
                "price": price,
                "tier": first_tier
            }
    
    return dict(cheapest_by_category)

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
