const API_VENDAS = "/vendas";
const API_CLIENTES = "/clientes";
const API_PRODUTOS = "/produtos";

const form = document.getElementById("vendaForm");
const campoId = document.getElementById("id");
const campoDataVenda = document.getElementById("dataVenda");
const campoCliente = document.getElementById("cliente");
const campoQuantidade = document.getElementById("quantidade");
const campoLoja = document.getElementById("loja");
const campoProduto = document.getElementById("produto");
const campoValorTotal = document.getElementById("valorTotal");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const listaVendas = document.getElementById("listaVendas");
const mensagem = document.getElementById("mensagem");
let produtosDisponiveis = [];

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

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function adicionarCelula(linha, valor) {
    const celula = document.createElement("td");
    celula.textContent = valor ?? "";
    linha.appendChild(celula);
}

function renderizarVendas(vendas) {
    listaVendas.replaceChildren();

    vendas.forEach(venda => {
        const linha = document.createElement("tr");
        adicionarCelula(linha, venda.id);
        adicionarCelula(linha, venda.dataVenda ? new Date(venda.dataVenda).toLocaleString("pt-BR") : "");
        adicionarCelula(linha, venda.cliente?.nome);
        adicionarCelula(linha, venda.loja);
        adicionarCelula(linha, venda.produto?.nome);
        adicionarCelula(linha, venda.quantidade);
        adicionarCelula(linha, formatarMoeda(venda.valorTotal));

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.type = "button";
        btnEditar.className = "editar";
        btnEditar.addEventListener("click", () => editarVenda(venda));

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.type = "button";
        btnExcluir.className = "excluir";
        btnExcluir.addEventListener("click", () => excluirVenda(venda.id));

        celulaAcoes.append(btnEditar, btnExcluir);
        linha.appendChild(celulaAcoes);
        listaVendas.appendChild(linha);
    });
}

async function carregarVendas() {
    try {
        renderizarVendas(await requisitar(API_VENDAS));
    } catch (erro) {
        exibirMensagem(`Erro ao carregar vendas: ${erro.message}`, true);
    }
}

function preencherDropdown(select, registros, rotulo, textoOpcao) {
    select.replaceChildren(new Option(rotulo, ""));
    registros.forEach(registro => {
        select.add(new Option(textoOpcao(registro), registro.id));
    });
}

async function carregarOpcoes() {
    try {
        const [clientes, produtos] = await Promise.all([
            requisitar(API_CLIENTES),
            requisitar(API_PRODUTOS)
        ]);
        produtosDisponiveis = produtos;

        preencherDropdown(
            campoCliente,
            clientes,
            clientes.length ? "Selecione um cliente" : "Nenhum cliente cadastrado",
            cliente => `${cliente.nome} (${cliente.email})`
        );
        preencherDropdown(
            campoProduto,
            produtos,
            produtos.length ? "Selecione um produto" : "Nenhum produto cadastrado",
            produto => `${produto.nome} - ${formatarMoeda(produto.preco)}`
        );
    } catch (erro) {
        exibirMensagem(`Erro ao carregar clientes e produtos: ${erro.message}`, true);
        campoCliente.replaceChildren(new Option("Não foi possível carregar clientes", ""));
        campoProduto.replaceChildren(new Option("Não foi possível carregar produtos", ""));
    }
}

function atualizarValorTotal() {
    const produtoSelecionado = produtosDisponiveis.find(
        produto => String(produto.id) === campoProduto.value
    );
    const quantidade = Number(campoQuantidade.value);
    const total = produtoSelecionado && quantidade > 0
        ? Number(produtoSelecionado.preco) * quantidade
        : 0;
    campoValorTotal.value = total.toFixed(2);
}

function editarVenda(venda) {
    campoId.value = venda.id;
    campoDataVenda.value = venda.dataVenda ? venda.dataVenda.slice(0, 16) : "";
    campoCliente.value = venda.cliente.id;
    campoQuantidade.value = venda.quantidade;
    campoLoja.value = venda.loja ?? "";
    campoProduto.value = venda.produto.id;
    atualizarValorTotal();
    btnSalvar.textContent = "Salvar alterações";
    btnCancelar.hidden = false;
    exibirMensagem(`Editando a venda ${venda.id}.`);
    campoCliente.focus();
}

function limparFormulario() {
    form.reset();
    campoId.value = "";
    campoQuantidade.value = "1";
    campoValorTotal.value = "0.00";
    btnSalvar.textContent = "Registrar venda";
    btnCancelar.hidden = true;
}

form.addEventListener("submit", async evento => {
    evento.preventDefault();

    const id = campoId.value;
    const venda = {
        dataVenda: campoDataVenda.value,
        cliente: { id: Number(campoCliente.value) },
        loja: campoLoja.value.trim(),
        produto: { id: Number(campoProduto.value) },
        quantidade: Number(campoQuantidade.value)
    };

    if (id) {
        venda.id = Number(id);
    }

    try {
        renderizarVendas(await requisitar(API_VENDAS, id ? "PUT" : "POST", venda));
        limparFormulario();
        exibirMensagem(id ? "Venda atualizada com sucesso!" : "Venda cadastrada com sucesso!");
    } catch (erro) {
        exibirMensagem(`Erro ao salvar venda: ${erro.message}`, true);
    }
});

async function excluirVenda(id) {
    if (!confirm("Deseja realmente excluir esta venda?")) {
        return;
    }

    try {
        renderizarVendas(await requisitar(`${API_VENDAS}/${id}`, "DELETE"));
        if (campoId.value === String(id)) {
            limparFormulario();
        }
        exibirMensagem("Venda excluída com sucesso!");
    } catch (erro) {
        exibirMensagem(`Erro ao excluir venda: ${erro.message}`, true);
    }
}

btnCancelar.addEventListener("click", () => {
    limparFormulario();
    exibirMensagem("Edição cancelada.");
});

campoProduto.addEventListener("change", atualizarValorTotal);
campoQuantidade.addEventListener("input", atualizarValorTotal);

carregarOpcoes();
carregarVendas();