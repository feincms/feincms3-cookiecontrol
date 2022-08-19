# Generated by Django 4.0.7 on 2022-08-19 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Script",
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
                    "script",
                    models.TextField(
                        blank=True,
                        help_text="HTML code to inject if cookies are accepted.",
                        verbose_name="script",
                    ),
                ),
            ],
            options={
                "verbose_name": "cookie script",
                "verbose_name_plural": "cookie scripts",
                "ordering": ["name"],
            },
        ),
    ]