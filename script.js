document.addEventListener("DOMContentLoaded", function() {
    carregarProdutos();
});

function carregarProdutos() {
    fetch("produtos.json")
    .then(response => response.json())
    .then(data => {
        const listaProdutos = document.getElementById("lista-produtos-body");
        listaProdutos.innerHTML = "";
        data.forEach(produto => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.codigo}</td>
                <td>R$ ${produto.valor.toFixed(2)}</td>
                <td>${produto.quantidade}</td>
            `;
            listaProdutos.appendChild(tr);
        });
    });
}

function adicionarAoCarrinho() {
    const buscaProduto = document.getElementById("busca-produto").value.toLowerCase();
    fetch("produtos.json")
    .then(response => response.json())
    .then(data => {
        const produtoEncontrado = data.find(produto => 
            produto.nome.toLowerCase() === buscaProduto || produto.codigo.toLowerCase() === buscaProduto);
        if (produtoEncontrado) {
            if (produtoEncontrado.quantidade > 0) {
                const carrinho = document.getElementById("carrinho");
                const li = document.createElement("li");
                li.textContent = `${produtoEncontrado.nome} - R$ ${produtoEncontrado.valor}`;
                carrinho.appendChild(li);
                produtoEncontrado.quantidade--;
                atualizarQuantidadeNoArquivo(data);
                carregarProdutos();
                calcularValorTotal();
            } else {
                alert("Este produto está esgotado.");
            }
        } else {
            alert("Produto não encontrado.");
        }
    });
}

function finalizarVenda() {
    const carrinho = document.getElementById("carrinho");
    const produtosCarrinho = carrinho.getElementsByTagName("li");
    const produtosVendidos = Array.from(produtosCarrinho).map(item => item.textContent.trim().split(" - ")[0]);
    fetch("produtos.json")
    .then(response => response.json())
    .then(data => {
        produtosVendidos.forEach(produto => {
            const produtoEncontrado = data.find(p => p.nome === produto);
            if (produtoEncontrado) {
                produtoEncontrado.quantidade--;
            }
        });
        atualizarQuantidadeNoArquivo(data);
        carregarProdutos();
        carrinho.innerHTML = "";
        calcularValorTotal();
    });
}

function atualizarQuantidadeNoArquivo(data) {
    fetch("produtos.json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}

function calcularValorTotal() {
    const carrinho = document.getElementById("carrinho");
    const produtosCarrinho = carrinho.getElementsByTagName("li");
    let total = 0;
    Array.from(produtosCarrinho).forEach(item => {
        const valorProduto = parseFloat(item.textContent.trim().split(" - ")[1].substring(3));
        total += valorProduto;
    });
    document.getElementById("valor-total").textContent = `Valor Total: R$ ${total.toFixed(2)}`;
}
