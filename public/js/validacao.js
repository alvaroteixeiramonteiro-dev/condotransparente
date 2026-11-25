// Browser-side form validation.
// It only gives instant feedback, before the form is sent. It does NOT replace the
// validation on the server: JavaScript can be turned off or bypassed, so the routes
// (routes/*.js) always validate again.
// It acts only on pages that have a <form id="form-principal"> and a <ul id="erros-js">.

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-principal');
    if (!form) {
        return; // this page has no form to validate
    }

    form.addEventListener('submit', function (event) {
        const erros = [];

        // Name of a field for the messages: the text of its <label>, or its name attribute
        function nomeDoCampo(campo) {
            const label = form.querySelector('label[for="' + campo.id + '"]');
            return (label ? label.textContent : campo.name).trim();
        }

        // Value of a field as the server sees it: text fields are trimmed
        // (lerCondominio does trim()), the password is NOT (routes/auth.js keeps it as typed)
        function valorDoCampo(campo) {
            return campo.type === 'password' ? campo.value : campo.value.trim();
        }

        // 1. Required fields (the ones with the required attribute)
        form.querySelectorAll('[required]').forEach(function (campo) {
            if (campo.type === 'checkbox') {
                if (!campo.checked) {
                    erros.push('Tem de aceitar a política de privacidade.');
                }
            } else if (valorDoCampo(campo) === '') {
                erros.push('Preencha o campo "' + nomeDoCampo(campo) + '".');
            }
        });

        // 2. Email with a valid format (same rule as routes/auth.js)
        const email = document.getElementById('email');
        if (email && email.value.trim() !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
            erros.push('O email não parece válido.');
        }

        // 3. Minimum length: every field with data-minimo (password, name, address...).
        // Empty fields are skipped here because rule 1 already reports them.
        form.querySelectorAll('[data-minimo]').forEach(function (campo) {
            const minimo = Number(campo.dataset.minimo);
            const valor = valorDoCampo(campo);
            if (valor !== '' && valor.length < minimo) {
                erros.push('O campo "' + nomeDoCampo(campo) + '" tem de ter pelo menos ' + minimo + ' caracteres.');
            }
        });

        // If there are errors: stop the submission and show them in the list
        if (erros.length > 0) {
            event.preventDefault();
            const caixa = document.getElementById('erros-js');
            if (caixa) {
                caixa.innerHTML = '';
                erros.forEach(function (texto) {
                    const li = document.createElement('li');
                    li.textContent = texto; // textContent, never innerHTML (avoids XSS)
                    caixa.appendChild(li);
                });
                caixa.style.display = 'block';
                caixa.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});
