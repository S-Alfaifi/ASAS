"""Arabic Text Preprocessing Service

Robust pipeline for cleaning Arabic text before sentiment analysis.
Handles: diacritics, normalization, URLs, emojis, repeated chars, etc.
"""
import re


class ArabicPreprocessor:
    """Comprehensive Arabic text preprocessing"""

    # Arabic Unicode ranges
    ARABIC_RANGE = r'\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF'

    # Diacritics (tashkeel) to remove
    DIACRITICS = re.compile(r'[\u064B-\u065F\u0670]')

    # Tatweel (kashida)
    TATWEEL = re.compile(r'\u0640')

    # URLs
    URL_PATTERN = re.compile(r'https?://\S+|www\.\S+')

    # Mentions and hashtags
    MENTION_PATTERN = re.compile(r'@\w+')
    HASHTAG_PATTERN = re.compile(r'#(\w+)')

    # Non-Arabic/non-space characters (keep Arabic + spaces + basic punctuation)
    NON_ARABIC = re.compile(rf'[^{ARABIC_RANGE}\s\d.,!?؟،؛]')

    # Repeated characters (3+ same char → 2)
    REPEATED_CHARS = re.compile(r'(.)\1{2,}')

    # Extra whitespace
    EXTRA_SPACES = re.compile(r'\s+')

    # Alef variants mapping
    ALEF_VARIANTS = {
        '\u0622': '\u0627',  # آ → ا
        '\u0623': '\u0627',  # أ → ا
        '\u0625': '\u0627',  # إ → ا
        '\u0671': '\u0627',  # ٱ → ا
    }

    # Taa marbuta → haa
    TAA_MARBUTA = '\u0629'
    HAA = '\u0647'

    @classmethod
    def preprocess(cls, text: str) -> str:
        """Full preprocessing pipeline"""
        if not text or not isinstance(text, str):
            return ''

        text = text.strip()

        # Step 1: Remove URLs
        text = cls.URL_PATTERN.sub(' ', text)

        # Step 2: Remove mentions (keep hashtag text)
        text = cls.MENTION_PATTERN.sub(' ', text)
        text = cls.HASHTAG_PATTERN.sub(r'\1', text)

        # Step 3: Remove diacritics (tashkeel)
        text = cls.DIACRITICS.sub('', text)

        # Step 4: Remove tatweel (kashida)
        text = cls.TATWEEL.sub('', text)

        # Step 5: Normalize alef variants
        for variant, replacement in cls.ALEF_VARIANTS.items():
            text = text.replace(variant, replacement)

        # Step 6: Normalize taa marbuta
        text = text.replace(cls.TAA_MARBUTA, cls.HAA)

        # Step 7: Remove non-Arabic characters
        text = cls.NON_ARABIC.sub(' ', text)

        # Step 8: Reduce repeated characters
        text = cls.REPEATED_CHARS.sub(r'\1\1', text)

        # Step 9: Clean up whitespace
        text = cls.EXTRA_SPACES.sub(' ', text).strip()

        return text

    @classmethod
    def is_arabic(cls, text: str) -> bool:
        """Check if text contains meaningful Arabic content"""
        if not text:
            return False
        arabic_chars = re.findall(rf'[{cls.ARABIC_RANGE}]', text)
        return len(arabic_chars) >= 2  # At least 2 Arabic characters

    @classmethod
    def preprocess_batch(cls, texts: list) -> list:
        """Preprocess a batch of texts"""
        return [cls.preprocess(t) for t in texts]
