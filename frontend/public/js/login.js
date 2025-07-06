document.getElementById('formLogin').addEventListener('submit', async e => {
  e.preventDefault();

  const data = { 
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value
  };
  
  if (!data.email || !data.senha) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {  
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
      credentials: 'include' 
    });

    const result = await response.json(); 

    if (response.ok && result.redirect) {
      window.location.href = result.redirect;
    } else {
      alert(result.error || 'Erro ao fazer login');
    }
  } catch (err) {
    alert('Erro na conexão com o servidor.');
    console.error(err);
  }
});
