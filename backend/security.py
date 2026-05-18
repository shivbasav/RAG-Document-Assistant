INJECTION_SIGNALS = [
    "ignore previous", "disregard", "forget instructions",
    "system prompt", "developer mode", "jailbreak",
    "as an ai with no restrictions", "dan mode",
]

PII_SIGNALS = [
    "api key", "password", "secret", "token", "bearer",
    "authorization", "private key",
]

def detect_injection(text) -> bool:
    """Detects potential prompt injection attempts."""
    lower_text = text.lower()
    return any(signal in lower_text for signal in INJECTION_SIGNALS)

def detect_pii(text) -> bool:
    """Detects potential PII exposure."""
    lower_text = text.lower()
    return any(signal in lower_text for signal in PII_SIGNALS)

def validate_user_input(text: str) -> tuple[bool, str]:
    """Returns (is_valid, error_message)"""
    if not text or not text.strip():
        return False, "Query cannot be empty"
    if len(text) > 2000:
        return False, "Query too long — max 2000 characters"
    if detect_injection(text):
        return False, "Invalid query content detected"
    return True, ""