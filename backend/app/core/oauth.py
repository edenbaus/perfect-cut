"""
OAuth configuration for Perfect Cut.
Supports Google OAuth 2.0 authentication.
"""

from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import os

# Load configuration
config = Config(environ=os.environ)

# OAuth configuration
GOOGLE_CLIENT_ID = config.get("GOOGLE_CLIENT_ID", default=None)
GOOGLE_CLIENT_SECRET = config.get("GOOGLE_CLIENT_SECRET", default=None)
GOOGLE_REDIRECT_URI = config.get("GOOGLE_REDIRECT_URI", default="http://localhost:8001/api/auth/google/callback")

# Initialize OAuth
oauth = OAuth()

# Register Google OAuth provider
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'redirect_uri': GOOGLE_REDIRECT_URI
        }
    )


def get_oauth_client():
    """Get the OAuth client instance."""
    return oauth


def is_oauth_configured() -> bool:
    """Check if OAuth is properly configured."""
    return bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
