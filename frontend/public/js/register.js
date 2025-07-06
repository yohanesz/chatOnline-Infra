document.addEventListener('DOMContentLoaded', async () => {
  // Usa a função de auth.js para verificar se já está logado
  const { isAuthenticated } = await checkAuth();
  if (isAuthenticated) {
    // Se estiver logado, redireciona para a página principal
    window.location.href = '/index.html';
    return; // Impede o resto do script de rodar
  }

  const form = document.getElementById('formRegister');
  const mensagem = document.getElementById('mensagem');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      senha: document.getElementById('senha').value
    };

    if (!data.nome || !data.email || !data.senha) {
      mensagem.textContent = 'Preencha todos os campos.';
      mensagem.style.color = 'red';
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.redirect) {
        window.location.href = result.redirect;
      } else {
        mensagem.textContent = result.error || 'Erro ao registrar usuário.';
        mensagem.style.color = 'red';
      }
    } catch (err) {
      mensagem.textContent = 'Erro na conexão com o servidor.';
      mensagem.style.color = 'red';
      console.error(err);
    }
  });
});
