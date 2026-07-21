import re

from django.core.exceptions import ValidationError

PHONE_RE = re.compile(r'^[\d\s+\-()]{7,20}$')
USERNAME_RE = re.compile(r'^[\w.@+-]{3,150}$')


def validate_phone(value: str) -> str:
    cleaned = value.strip()
    digits = re.sub(r'\D', '', cleaned)
    if len(digits) < 10 or len(digits) > 15:
        raise ValidationError('Укажите корректный номер телефона')
    if not PHONE_RE.match(cleaned):
        raise ValidationError('Недопустимые символы в номере телефона')
    return cleaned


def validate_username(value: str) -> str:
    cleaned = value.strip()
    if not USERNAME_RE.match(cleaned):
        raise ValidationError('Логин: 3–150 символов, буквы, цифры, @ . + - _')
    return cleaned


def strip_control_chars(value: str) -> str:
    return ''.join(ch for ch in value if ch == '\n' or ch == '\t' or ord(ch) >= 32).strip()
