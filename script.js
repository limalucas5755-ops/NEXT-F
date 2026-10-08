// NEXT FIGHT - JavaScript

// Modo escuro / claro
const modoBtn = document.getElementById("modoBtn");
const temaSalvo = localStorage.getItem("nextFightTema");

if (temaSalvo === "dark") {
    document.body.classList.add("dark");
    if (modoBtn) modoBtn.textContent = "Modo Claro";
}

if (modoBtn) {
    modoBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const dark = document.body.classList.contains("dark");
        modoBtn.textContent = dark ? "Modo Claro" : "Modo Escuro";
        localStorage.setItem("nextFightTema", dark ? "dark" : "light");
    });
}

// "Ver modalidades": mostra os dias e horários da modalidade.
document.querySelectorAll(".creative-btn").forEach(botao => {
    botao.addEventListener("click", () => {
        const modalidade = botao.dataset.modalidade;
        const id = "info-" + modalidade.toLowerCase().replace(/\s+/g, "-");
        const info = document.getElementById(id);
        document.querySelectorAll(".training-info").forEach(item => {
            if (item !== info) item.classList.remove("show");
        });
        if (info) {
            const aberto = info.classList.toggle("show");
            botao.textContent = aberto ? "Ocultar horários ↑" : "Ver modalidades";
        }
    });
});

// Cálculo automático dos planos.
const plano = document.getElementById("plano");
const valorPlano = document.getElementById("valorPlano");
if (plano && valorPlano) {
    plano.addEventListener("change", () => {
        const valor = Number(plano.value);
        valorPlano.textContent = valor ? valor.toLocaleString("pt-BR", {style:"currency", currency:"BRL"}) : "R$ 0,00";
    });
}

// Formulário da página de contato.
const formulario = document.getElementById("formulario");
if (formulario) {
    formulario.addEventListener("submit", event => {
        event.preventDefault();
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const assunto = document.getElementById("assunto").value;
        const mensagem = document.getElementById("mensagem").value.trim();
        const resposta = document.getElementById("mensagemForm");
        if (!nome || !email || !assunto || !mensagem) {
            resposta.textContent = "Por favor, preencha todos os campos.";
            resposta.style.color = "#e50914";
            return;
        }
        resposta.textContent = `Mensagem enviada com sucesso, ${nome}! A NEXT FIGHT entrará em contato.`;
        resposta.style.color = "green";
        formulario.reset();
    });
}

// Controle de cadastros: os dados são mantidos no localStorage deste navegador.
const cadastroForm = document.getElementById("cadastroForm");
const STORAGE_KEY = "nextFightCadastros";
const lerCadastros = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const salvarCadastros = cadastros => localStorage.setItem(STORAGE_KEY, JSON.stringify(cadastros));
const escapeHtml = valor => String(valor || "").replace(/[&<>'"]/g, caractere => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[caractere]));

if (cadastroForm) {
    const ids = ["cadNome", "cadNascimento", "cadEmail", "cadTelefone", "cadModalidade", "cadPlano", "cadNivel", "cadObservacao"];
    const resposta = document.getElementById("mensagemCadastro");
    const lista = document.getElementById("listaCadastros");
    const busca = document.getElementById("buscarCadastro");
    const filtroModalidade = document.getElementById("filtroModalidade");
    const filtroStatus = document.getElementById("filtroStatus");

    const atualizarFiltros = cadastros => {
        const atual = filtroModalidade.value;
        const modalidades = [...new Set(cadastros.map(item => item.modalidade))].sort();
        filtroModalidade.innerHTML = '<option value="">Todas as modalidades</option>' + modalidades.map(item => `<option>${escapeHtml(item)}</option>`).join("");
        filtroModalidade.value = modalidades.includes(atual) ? atual : "";
    };

    const renderizar = () => {
        const cadastros = lerCadastros();
        atualizarFiltros(cadastros);
        const termo = busca.value.trim().toLowerCase();
        const filtrados = cadastros.filter(item => {
            const combinaBusca = !termo || [item.nome, item.email, item.telefone].some(valor => valor.toLowerCase().includes(termo));
            return combinaBusca && (!filtroModalidade.value || item.modalidade === filtroModalidade.value) && (!filtroStatus.value || item.status === filtroStatus.value);
        });
        document.getElementById("totalCadastros").textContent = cadastros.length;
        document.getElementById("cadastrosAtivos").textContent = cadastros.filter(item => item.status === "ativo").length;
        document.getElementById("modalidadesAtivas").textContent = new Set(cadastros.map(item => item.modalidade)).size;
        lista.innerHTML = filtrados.length ? filtrados.map(item => `<tr>
            <td><strong>${escapeHtml(item.nome)}</strong><small>Nasc.: ${escapeHtml(item.nascimento)}</small></td>
            <td>${escapeHtml(item.email)}<small>${escapeHtml(item.telefone)}</small></td>
            <td>${escapeHtml(item.modalidade)}<small>${escapeHtml(item.nivel)}</small></td>
            <td>${escapeHtml(item.plano)}</td>
            <td><button class="status-badge ${item.status}" data-action="status" data-id="${item.id}">${item.status === "ativo" ? "Ativo" : "Inativo"}</button></td>
            <td class="action-buttons"><button data-action="editar" data-id="${item.id}" title="Editar cadastro">Editar</button><button class="danger" data-action="excluir" data-id="${item.id}" title="Excluir cadastro">Excluir</button></td>
        </tr>`).join("") : '<tr><td colspan="6" class="empty-state">Nenhum cadastro encontrado.</td></tr>';
    };

    cadastroForm.addEventListener("submit", event => {
        event.preventDefault();
        const dados = Object.fromEntries(ids.map(id => [id.replace("cad", "").toLowerCase(), document.getElementById(id).value.trim()]));
        const cadastros = lerCadastros();
        const idAtual = document.getElementById("cadastroId").value;
        if (idAtual) {
            const indice = cadastros.findIndex(item => String(item.id) === idAtual);
            if (indice >= 0) cadastros[indice] = {...cadastros[indice], ...dados};
            resposta.textContent = "Cadastro atualizado com sucesso!";
        } else {
            cadastros.unshift({id: Date.now(), ...dados, status: "ativo", criadoEm: new Date().toISOString()});
            resposta.textContent = `Cadastro realizado com sucesso, ${dados.nome}!`;
        }
        salvarCadastros(cadastros);
        resposta.style.color = "green";
        cadastroForm.reset();
        document.getElementById("cadastroId").value = "";
        document.getElementById("tituloFormulario").textContent = "Seus dados";
        document.getElementById("botaoCadastro").textContent = "FINALIZAR CADASTRO";
        document.getElementById("cancelarEdicao").classList.add("hidden");
        renderizar();
    });

    document.getElementById("cancelarEdicao").addEventListener("click", () => {
        cadastroForm.reset();
        document.getElementById("cadastroId").value = "";
        document.getElementById("tituloFormulario").textContent = "Seus dados";
        document.getElementById("botaoCadastro").textContent = "FINALIZAR CADASTRO";
        document.getElementById("cancelarEdicao").classList.add("hidden");
        resposta.textContent = "";
    });

    lista.addEventListener("click", event => {
        const botao = event.target.closest("button[data-action]");
        if (!botao) return;
        const id = Number(botao.dataset.id);
        const cadastros = lerCadastros();
        const item = cadastros.find(cadastro => cadastro.id === id);
        if (!item) return;
        if (botao.dataset.action === "excluir") {
            if (!window.confirm(`Excluir o cadastro de ${item.nome}?`)) return;
            salvarCadastros(cadastros.filter(cadastro => cadastro.id !== id));
            resposta.textContent = "Cadastro excluído.";
            resposta.style.color = "#e50914";
        } else if (botao.dataset.action === "status") {
            item.status = item.status === "ativo" ? "inativo" : "ativo";
            salvarCadastros(cadastros);
        } else {
            document.getElementById("cadastroId").value = item.id;
            ids.forEach(chave => document.getElementById(chave).value = item[chave.replace("cad", "").toLowerCase()] || "");
            document.getElementById("tituloFormulario").textContent = "Editar cadastro";
            document.getElementById("botaoCadastro").textContent = "SALVAR ALTERAÇÕES";
            document.getElementById("cancelarEdicao").classList.remove("hidden");
            window.scrollTo({top: 0, behavior: "smooth"});
        }
        renderizar();
    });

    [busca, filtroModalidade, filtroStatus].forEach(campo => campo.addEventListener("input", renderizar));
    document.getElementById("exportarCadastros").addEventListener("click", () => {
        const cadastros = lerCadastros();
        if (!cadastros.length) { resposta.textContent = "Não há cadastros para exportar."; resposta.style.color = "#e50914"; return; }
        const colunas = ["nome", "nascimento", "email", "telefone", "modalidade", "plano", "nivel", "observacao", "status"];
        const csv = [colunas.join(";"), ...cadastros.map(item => colunas.map(coluna => `"${String(item[coluna] || "").replace(/"/g, '""')}"`).join(";"))].join("\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], {type: "text/csv;charset=utf-8;"}));
        link.download = "cadastros-next-fight.csv";
        link.click();
        URL.revokeObjectURL(link.href);
    });
    renderizar();
}
