const API_URL = "/clientes";

const form = document.getElementById("clienteForm");
const campoId = document.getElementById("id");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const listaClientes = document.getElementById("listaClientes");
const mensagem = document.getElementById("mensagem");

function exibirMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.color = erro ? "red" : "green";
}

async function requisitar(url, metodo = "GET", dados = null) {
    const opcoes = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (dados !== null) {
        opcoes.body = JSON.stringify(dados);
    }

    const resposta = await fetch(url, opcoes);

    if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(detalhe || `Erro HTTP ${resposta.status}`);
    }

    return resposta.json();
}

function renderizarClientes(clientes) {
    listaClientes.replaceChildren();

    clientes.forEach(cliente => {
        const linha = document.createElement("tr");

        function adicionarCelula(valor) {
            const celula = document.createElement("td");
            celula.textContent = valor ?? "";
            linha.appendChild(celula);
        }

        adicionarCelula(cliente.id);
        adicionarCelula(cliente.nome);
        adicionarCelula(cliente.email);

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.type = "button";
        btnEditar.className = "editar";
        btnEditar.addEventListener("click", () => editarCliente(cliente));

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.type = "button";
        btnExcluir.className = "excluir";
        btnExcluir.addEventListener("click", () => excluirCliente(cliente.id));

        celulaAcoes.append(btnEditar, btnExcluir);
        linha.appendChild(celulaAcoes);
        listaClientes.appendChild(linha);
    });
}

async function carregarClientes() {
    try {
        renderizarClientes(await requisitar(API_URL));
    } catch (erro) {
        exibirMensagem(`Erro ao carregar clientes: ${erro.message}`, true);
    }
}

function editarCliente(cliente) {
    campoId.value = cliente.id;
    campoNome.value = cliente.nome;
    campoEmail.value = cliente.email;
    btnSalvar.textContent = "Salvar alterações";
    btnCancelar.hidden = false;
    exibirMensagem(`Editando o cliente ${cliente.nome}.`);
    campoNome.focus();
}

function limparFormulario() {
    form.reset();
    campoId.value = "";
    btnSalvar.textContent = "Cadastrar";
    btnCancelar.hidden = true;
}

form.addEventListener("submit", async evento => {
    evento.preventDefault();

    const id = campoId.value;
    const cliente = {
        nome: campoNome.value.trim(),
        email: campoEmail.value.trim()
    };

    if (id) {
        cliente.id = Number(id);
    }

    try {
        renderizarClientes(await requisitar(API_URL, id ? "PUT" : "POST", cliente));
        limparFormulario();
        exibirMensagem(id ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
    } catch (erro) {
        exibirMensagem(`Erro ao salvar cliente: ${erro.message}`, true);
    }
});

async function excluirCliente(id) {
    if (!confirm("Deseja realmente excluir este cliente?")) {
        return;
    }

    try {
        renderizarClientes(await requisitar(`${API_URL}/${id}`, "DELETE"));
        if (campoId.value === String(id)) {
            limparFormulario();
        }
        exibirMensagem("Cliente excluído com sucesso!");
    } catch (erro) {
        exibirMensagem(`Erro ao excluir cliente: ${erro.message}`, true);
    }
}

btnCancelar.addEventListener("click", () => {
    limparFormulario();
    exibirMensagem("Edição cancelada.");
});

carregarClientes();