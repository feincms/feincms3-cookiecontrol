import json
from pathlib import Path

from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.views.decorators.cache import cache_page

from feincms3_cookiecontrol.models import (
    COOKIECONTROL_CACHE_TIMEOUT,
    cookiecontrol_data,
)


BASE = Path(__file__).parent / "static" / "feincms3_cookiecontrol"


def read_staticfile(filename):
    return (BASE / filename).read_text()


@cache_page(COOKIECONTROL_CACHE_TIMEOUT)
def inject(request):
    data = json.dumps(
        cookiecontrol_data(),
        cls=DjangoJSONEncoder,
        ensure_ascii=False,
        separators=(",", ":"),
    )
    content = f"""\
(function(){{\
window.f3ccData={data};\
{read_staticfile('build.js')}\
}})()\
"""

    response = HttpResponse(content, content_type="text/javascript; charset=UTF-8")
    return response
