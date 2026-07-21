from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    scope = 'auth'


class ConsultationRateThrottle(AnonRateThrottle):
    scope = 'consultation'


class ReviewRateThrottle(UserRateThrottle):
    scope = 'review'
