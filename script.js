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
                const carrinhoBody = document.getElementById("carrinho-body");
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${produtoEncontrado.nome}</td>
                    <td>R$ ${produtoEncontrado.valor.toFixed(2)}</td>
                    <td><button onclick="removerDoCarrinho(this.parentNode.parentNode)">Remover</button></td>
                `;
                carrinhoBody.appendChild(tr);
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

function removerDoCarrinho(item) {
    const nomeProduto = item.cells[0].textContent;
    item.parentNode.removeChild(item);
    fetch("produtos.json")
    .then(response => response.json())
    .then(data => {
        const produtoEncontrado = data.find(p => p.nome === nomeProduto);
        if (produtoEncontrado) {
            produtoEncontrado.quantidade++;
            atualizarQuantidadeNoArquivo(data);
            carregarProdutos();
            calcularValorTotal();
        }
    });
}
function finalizarVenda() {
    const carrinhoBody = document.getElementById("carrinho-body");
    const produtosCarrinho = carrinhoBody.getElementsByTagName("tr");
    
    // Verifica se o carrinho está vazio
    if (produtosCarrinho.length === 0) {
        alert("O carrinho está vazio. Adicione produtos antes de finalizar a venda.");
        return;
    }
    
    const produtosVendidos = Array.from(produtosCarrinho).map(item => item.cells[0].textContent);
    let valorTotal = 0;
    fetch("produtos.json")
    .then(response => response.json())
    .then(data => {
        produtosVendidos.forEach(produto => {
            const produtoEncontrado = data.find(p => p.nome === produto);
            if (produtoEncontrado) {
                produtoEncontrado.quantidade--;
                valorTotal += produtoEncontrado.valor;
            }
        });
        atualizarQuantidadeNoArquivo(data);
        carregarProdutos();
        carrinhoBody.innerHTML = "";
        calcularValorTotal();
        
        // Abre uma nova guia para exibir os detalhes da venda
        const novaGuia = window.open("", "nota-de-balcao");
        novaGuia.document.write(`
            <html>
            <head>
                <title>Nota de Balcão</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1, h2 {
                        margin-top: 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .imprimir-btn {
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: #fff;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <h1>Nota de Balcão</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Valor Unitário</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${produtosVendidos.map(produto => {
                            const produtoEncontrado = data.find(p => p.nome === produto);
                            const valorTotalProduto = produtoEncontrado.valor;
                            return `
                                <tr>
                                    <td>${produto}</td>
                                    <td>1</td>
                                    <td>R$ ${valorTotalProduto.toFixed(2)}</td>
                                    <td>R$ ${valorTotalProduto.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="3">Valor Total</th>
                            <td>R$ ${valorTotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <button class="imprimir-btn" onclick="window.print()">Imprimir</button>
            </body>
            </html>
        `);
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
    const carrinhoBody = document.getElementById("carrinho-body");
    const produtosCarrinho = carrinhoBody.getElementsByTagName("tr");
    let total = 0;
    Array.from(produtosCarrinho).forEach(item => {
        const valorProduto = parseFloat(item.cells[1].textContent.substring(3));
        total += valorProduto;
    });
    document.getElementById("valor-total").textContent = `Valor Total: R$ ${total.toFixed(2)}`;
}
