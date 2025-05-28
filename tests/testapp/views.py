from django.shortcuts import render


def test_page(request):
    """Test page that includes the cookie control banner"""
    return render(request, "test_page.html")
