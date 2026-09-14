import os
import smtplib
from email.message import EmailMessage


def send_email(to_email: str, subject: str, html_body: str, text_body: str | None = None):
    mail_server = os.getenv("MAIL_SERVER")
    mail_port = int(os.getenv("MAIL_PORT", "587"))
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    mail_from = os.getenv("MAIL_FROM", mail_username or "no-reply@gestion-intervention.com")

    if not mail_server or not mail_username or not mail_password:
        # Pas de SMTP configuré : on log le contenu pour ne pas bloquer le dev/test.
        print("=" * 60)
        print("[EMAIL NON ENVOYÉ - SMTP non configuré dans .env]")
        print(f"À : {to_email}")
        print(f"Sujet : {subject}")
        print(text_body or html_body)
        print("=" * 60)
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = mail_from
    message["To"] = to_email
    message.set_content(text_body or "Votre client email ne supporte pas le HTML.")
    message.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(mail_server, mail_port) as server:
        server.starttls()
        server.login(mail_username, mail_password)
        server.send_message(message)

    return True
