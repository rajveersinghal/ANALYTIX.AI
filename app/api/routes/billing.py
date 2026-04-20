from fastapi import APIRouter, Depends, Header, Request, HTTPException
import stripe
from app.config import settings
from app.core.auth.security import get_current_user
from app.core.db.mongodb import get_database
from app.logger import logger
from app.utils.response_schema import success_response, error_response

router = APIRouter(prefix="/billing", tags=["Billing"])

stripe.api_key = settings.STRIPE_SECRET_KEY

# Prices config (usually you get these from env or db)
PRICE_LOOKUP = {
    "pro": "price_pro_subscription_id", 
    "enterprise": "price_enterprise_subscription_id"
}

@router.post("/checkout")
async def create_checkout_session(
    plan: str, 
    current_user: dict = Depends(get_current_user)
):
    """
    Creates a Stripe Checkout session to upgrade the user's plan.
    """
    if plan not in PRICE_LOOKUP:
        return error_response("Invalid plan selected")
        
    user_id = str(current_user["_id"])
    email = current_user.get("email")
    
    # If STRIPE_SECRET_KEY is empty, we act in "Development Sandbox" mode
    if not settings.STRIPE_SECRET_KEY:
        logger.warning("STRIPE_SECRET_KEY not set. Simulating Sandbox Upgrade.")
        return success_response(data={
            "checkout_url": f"http://localhost:3000/dashboard?upgrade_simulated=true&plan={plan}",
            "sandbox": True
        })
        
    try:
        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=email,
            client_reference_id=user_id,
            line_items=[{
                'price': PRICE_LOOKUP[plan],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{settings.BASE_DIR.replace('r:\\2026\\Project\\AnalytixAI', 'http://localhost:3000')}/projects?upgrade=success",
            cancel_url=f"{settings.BASE_DIR.replace('r:\\2026\\Project\\AnalytixAI', 'http://localhost:3000')}/pricing?upgrade=cancelled",
        )
        return success_response(data={"checkout_url": checkout_session.url})
    except Exception as e:
        logger.error(f"Stripe Checkout Error: {e}")
        return error_response(str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Stripe Webhook for handling subscription events.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        return success_response("Webhook skipped. No secret.")
        
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get("client_reference_id")
        
        # Upgrade User Tier in DB
        db = get_database()
        if user_id:
            from bson import ObjectId
            await db.users.update_one(
                {"_id": ObjectId(user_id)}, 
                {"$set": {"tier": "pro", "stripe_customer_id": session.get("customer")}}
            )
            logger.info(f"User {user_id} upgraded to PRO tier")

    return {"status": "success"}
