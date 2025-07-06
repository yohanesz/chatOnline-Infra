async function checkAuth() {
  try {
    const res = await fetch('/api/auth/user-info', { credentials: 'include' });

    if (res.ok) {
      const user = await res.json();
      return { isAuthenticated: true, user: user };
    } else {
      return { isAuthenticated: false };
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return { isAuthenticated: false, error: error };
  }
}

// Adiciona um listener para verificar a autenticação em todas as páginas
// que importam este script, exceto quando explicitamente evitado.
document.addEventListener('DOMContentLoaded', async () => {
    // Evita o redirecionamento automático em páginas que não o querem
    if (typeof window.autoRedirect === 'undefined' || window.autoRedirect) {
        const { isAuthenticated } = await checkAuth();
        if (!isAuthenticated) {
            window.location.href = '/login.html';
        }
    }
});
