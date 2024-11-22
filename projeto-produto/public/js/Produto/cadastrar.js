function gravarProduto(event) {
    event.preventDefault(); // Evita o envio do formulário de forma padrão

    var inputCodigo = document.getElementById("inputCodigo");
    var inputNome = document.getElementById("inputNome");
    var inputQtde = document.getElementById("inputQtde");
    var selMarca = document.getElementById("selMarca");
    var selCategoria = document.getElementById("selCategoria");
    var inputImagem = document.getElementById("inputImagem");
    var inputPreco = document.getElementById("inputPreco");

    // Validação dos campos
    if (inputCodigo.value && inputNome.value && inputQtde.value && inputQtde.value !== '0' &&
        selMarca.value !== '0' && selCategoria.value !== '0' && inputImagem.files.length > 0 &&
        inputPreco.value && inputPreco.value > '0') {

        var inputValue = inputImagem.files[0];
        if (inputValue.name.includes(".jpg") || inputValue.name.includes(".png")) {
            var formData = new FormData();
            formData.append("codigo", inputCodigo.value);
            formData.append("nome", inputNome.value);
            formData.append("quantidade", inputQtde.value);
            formData.append("marca", selMarca.value);
            formData.append("categoria", selCategoria.value);
            formData.append("inputImagem", inputValue);
            formData.append("preco", inputPreco.value);

            fetch('/admin/produto/cadastro', {
                method: "POST",
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erro ao cadastrar produto");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert("Produto cadastrado com sucesso!");
                    // Opcionalmente, limpar os campos após sucesso
                    document.getElementById("inputCodigo").value = '';
                    document.getElementById("inputNome").value = '';
                    document.getElementById("inputQtde").value = '';
                    document.getElementById("inputPreco").value = '';
                    document.getElementById("inputImagem").value = '';
                    document.getElementById("imgInput").style.display = 'none'; // Esconde a imagem exibida
                } else {
                    alert(data.message || "Erro ao cadastrar produto");
                }
            })
            .catch(error => {
                console.error(error);
                alert("Erro ao processar o cadastro do produto.");
            });
        } else {
            alert("Formato de arquivo inválido!");
        }
    } else {
        alert("Preencha todos os campos corretamente!");
    }
}
