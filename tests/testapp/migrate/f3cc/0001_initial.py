# Generated by Django 4.0.5 on 2022-06-01 09:29

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="CookieScript",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.SlugField(unique=True, verbose_name="technical name")),
                (
                    "acceptance",
                    models.CharField(
                        choices=[("optional", "optional"), ("mandatory", "mandatory")],
                        default="optional",
                        max_length=20,
                        verbose_name="acceptance",
                    ),
                ),
                (
                    "inject_if",
                    models.TextField(
                        blank=True,
                        help_text="HTML code to inject if cookies are accepted.",
                        verbose_name="inject if",
                    ),
                ),
            ],
            options={
                "verbose_name": "cookie script",
                "verbose_name_plural": "cookie scripts",
                "ordering": ("name",),
            },
        ),
    ]
