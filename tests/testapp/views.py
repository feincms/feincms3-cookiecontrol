from django.shortcuts import render


def test_page(request):
    """Test page that includes the cookie control banner"""
    return render(request, "test_page.html")


def test_embed_page(request):
    """Test page that includes embed functionality with cookie control"""
    return render(request, "test_embed_page.html")


def test_consent_mode_advanced_page(request):
    """Test page which loads the advanced Google Consent Mode defaults"""
    return render(request, "test_consent_mode_advanced_page.html")
