import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Iniciando verificação do fluxo de autenticação com Server Actions...")
        page.goto("http://localhost:3000/login", wait_until="networkidle")

        # Tentar login com credenciais inválidas
        print("Testando login com credenciais inválidas...")
        page.get_by_placeholder("seu@email.com").fill("invalid@example.com")
        page.get_by_placeholder("••••••••").fill("wrongpassword")
        page.get_by_role("button", name="Entrar").click()

        # Verificar se a URL contém a mensagem de erro
        expect(page).to_have_url(re.compile(r".*\/login\?message=Invalid%20login%20credentials"))
        print("Verificação de erro para login inválido passou.")

        # Voltar para a página de login limpa e tentar com credenciais válidas
        print("Testando login com credenciais válidas...")
        page.goto("http://localhost:3000/login", wait_until="networkidle")
        page.get_by_placeholder("seu@email.com").fill("test@test.com")
        page.get_by_placeholder("••••••••").fill("123456")
        page.get_by_role("button", name="Entrar").click()

        # O Server Action deve redirecionar para a página inicial
        expect(page).to_have_url(re.compile("http://localhost:3000/?$"), timeout=15000)
        print("Redirecionamento para a página inicial bem-sucedido.")

        # Usar um seletor mais específico para o avatar do usuário
        avatar = page.get_by_role("button", name="Informações Pessoais")
        expect(avatar).to_be_visible()
        print("Avatar do usuário visível no cabeçalho.")

        # Tirar o screenshot final
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot de sucesso salvo em jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"Ocorreu um erro durante o teste: {e}")
        html_content = page.content()
        with open("jules-scratch/verification/error.html", "w", encoding="utf-8") as f:
            f.write(html_content)
        print("HTML da página de erro salvo em jules-scratch/verification/error.html")

        page.screenshot(path="jules-scratch/verification/error.png")
        print("Screenshot de erro salvo em jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)