"""Domain and application-level exceptions (no HTTP coupling)."""


class AppError(Exception):
    """Base for application errors."""

    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    """Resource does not exist."""


class ForbiddenError(AppError):
    """Action not allowed for this principal."""


class ConflictError(AppError):
    """Request conflicts with current state (e.g. duplicate)."""


class DomainValidationError(AppError):
    """Invalid input for domain rules."""


class UnauthorizedError(AppError):
    """Missing or invalid authentication."""
