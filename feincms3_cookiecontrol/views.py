import json
from pathlib import Path

from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.views.decorators.cache import cache_page

from feincms3_cookiecontrol.models import (
    COOKIECONTROL_CACHE_TIMEOUT,
    cookiecontrol_data,
)


SCRIPT = Path(__file__).parent / "static" / "f3cc.js"


@cache_page(COOKIECONTROL_CACHE_TIMEOUT)
def inject(request, *, privacy_policy_url=None):
    data = cookiecontrol_data()
    if privacy_policy_url:
        data["privacyPolicyURL"] = request.build_absolute_uri(privacy_policy_url)
    serialized = json.dumps(
        data,
        cls=DjangoJSONEncoder,
        ensure_ascii=False,
        separators=(",", ":"),
    )
    content = f"""\
(function(){{\
window.f3ccData={serialized};\
{SCRIPT.read_text()}\
}})()\
"""
    return HttpResponse(content, content_type="text/javascript; charset=UTF-8")
