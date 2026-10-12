const botoesAdicionar = document.querySelectorAll("[data-adicionar]");
const itensCarrinho = document.querySelector("#itens-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");
const botaoLimpar = document.querySelector("#limpar-carrinho");
const botaoFinalizar = document.querySelector("#finalizar-pedido");
const nomeCliente = document.querySelector("#nome-cliente");
const campoObservacoes = document.querySelector("#observacoes");
const erroPedido = document.querySelector("#erro-pedido");
const contadorCarrinho = document.querySelector("#contador-carrinho");

const carrinho = {};

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function atualizarCarrinho() {
  itensCarrinho.innerHTML = "";

  const produtos = Object.values(carrinho);
  const carrinhoVazio = produtos.length === 0;

  if (carrinhoVazio) {
    const mensagem = document.createElement("p");
    mensagem.textContent = "Seu carrinho está vazio.";
    itensCarrinho.appendChild(mensagem);
  }

  let total = 0;

  produtos.forEach((produto) => {
    const subtotal = produto.preco * produto.quantidade;
    total += subtotal;

    const item = document.createElement("div");
    item.classList.add("item-carrinho");

    const nome = document.createElement("p");
    nome.textContent = produto.nome;

    const preco = document.createElement("p");
    preco.textContent = `${formatarMoeda(produto.preco)} cada`;

    const quantidade = document.createElement("p");
    quantidade.textContent = `Quantidade: ${produto.quantidade}`;

    const subtotalTexto = document.createElement("p");
    subtotalTexto.textContent = `Subtotal: ${formatarMoeda(subtotal)}`;

    const controles = document.createElement("div");

    const diminuir = document.createElement("button");
    diminuir.type = "button";
    diminuir.textContent = "−";
    diminuir.setAttribute("aria-label", `Diminuir ${produto.nome}`);
    diminuir.addEventListener("click", () => {
      alterarQuantidade(produto.nome, -1);
    });

    const aumentar = document.createElement("button");
    aumentar.type = "button";
    aumentar.textContent = "+";
    aumentar.setAttribute("aria-label", `Aumentar ${produto.nome}`);
    aumentar.addEventListener("click", () => {
      alterarQuantidade(produto.nome, 1);
    });

    const remover = document.createElement("button");
    remover.type = "button";
    remover.textContent = "Remover";
    remover.addEventListener("click", () => {
      delete carrinho[produto.nome];
      atualizarCarrinho();
    });

    controles.append(diminuir, aumentar, remover);

    item.append(nome, preco, quantidade, subtotalTexto, controles);

    itensCarrinho.appendChild(item);
  });

  const quantidadeTotal = produtos.reduce(
    (soma, produto) => soma + produto.quantidade,
    0,
  );

  contadorCarrinho.textContent = `${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"} no carrinho`;

  totalCarrinho.textContent = formatarMoeda(total);
  botaoFinalizar.disabled = carrinhoVazio;
}

function alterarQuantidade(nome, alteracao) {
  if (!carrinho[nome]) {
    return;
  }

  carrinho[nome].quantidade += alteracao;

  if (carrinho[nome].quantidade <= 0) {
    delete carrinho[nome];
  }

  atualizarCarrinho();
}

botoesAdicionar.forEach((botao) => {
  botao.addEventListener("click", () => {
    const nome = botao.dataset.nome;
    const preco = Number(botao.dataset.preco);

    if (!nome || !Number.isFinite(preco) || preco <= 0) {
      return;
    }

    if (carrinho[nome]) {
      carrinho[nome].quantidade++;
    } else {
      carrinho[nome] = {
        nome: nome,
        preco: preco,
        quantidade: 1,
      };
    }

    atualizarCarrinho();

    document.querySelector("#carrinho").scrollIntoView({
      behavior: "smooth",
    });
  });
});

botaoLimpar.addEventListener("click", () => {
  Object.keys(carrinho).forEach((nome) => {
    delete carrinho[nome];
  });

  atualizarCarrinho();
});

botaoFinalizar.addEventListener("click", () => {
  const produtos = Object.values(carrinho);

  if (produtos.length === 0) {
    return;
  }

  const nome = nomeCliente.value.trim();
  const observacoes = campoObservacoes.value.trim();

  if (!nome) {
    erroPedido.textContent = "Digite seu nome para continuar.";
    nomeCliente.focus();
    return;
  }

  erroPedido.textContent = "";

  let total = 0;

  const linhas = produtos.map((produto) => {
    const subtotal = produto.preco * produto.quantidade;
    total += subtotal;

    return `${produto.quantidade}x ${produto.nome} - ${formatarMoeda(subtotal)}`;
  });

  const mensagem = [
    "Olá! Gostaria de fazer este pedido.",
    `Nome: ${nome}`,
    "",
    ...linhas,
    "",
    `Total: ${formatarMoeda(total)}`,
    ...(observacoes ? ["", `Observações: ${observacoes}`] : []),
  ].join("\n");

  const telefone = "55000000000";

  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank", "noopener,noreferrer");
});

nomeCliente.addEventListener("input", () => {
  erroPedido.textContent = "";
});

atualizarCarrinho();
