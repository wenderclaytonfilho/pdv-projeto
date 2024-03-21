document.addEventListener("DOMContentLoaded", function() {
    carregarProdutos();
});

function carregarProdutos() {
    fetch("produtos.json")
    .then(response => response.json())
    .then(data => {
        const listaProdutos = document.getElementById("lista-produtos");
        listaProdutos.innerHTML = "";
        data.forEach(produto => {
            const li = document.createElement("li");
            li.textContent = `${produto.nome} (Código: ${produto.codigo}) - R$ ${produto.valor} - ${produto.quantidade} disponíveis`;
            listaProdutos.appendChild(li);
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
