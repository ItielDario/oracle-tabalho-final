const PedidoItemModel = require("../models/pedidoItemModel");
const PedidoModel = require("../models/pedidoModel");
const ProdutoModel = require("../models/produtoModel");
const { ociHttpRequest } = require('../middlewares/ociHttpRequest');

class VitrineController {

    async listarProdutosView(req, res) {
        let produto = new ProdutoModel();
        let listaProdutos = await produto.listarProdutos();

        res.render('vitrine/index', { produtos: listaProdutos, layout: 'vitrine/index' });
    }

    async gravarPedido(req, res){
        let {carrinho, email} = req.body
        var ok = false;
        var msg = "";

        if(carrinho != null && carrinho != "" && email != null && email != ""){
            if(carrinho.length > 0) {      

                let pedido = new PedidoModel();
                let listaPedido = req.body;
                let listaErros = await pedido.validarPedido(listaPedido);

                if(listaErros.length == 0){

                    await pedido.gravar();

                    if(pedido.pedidoId > 0){
                        for(let i = 0; i<listaPedido.length; i++){
                            let pedidoItem = new PedidoItemModel();
                            pedidoItem.pedidoId = pedido.pedidoId;
                            pedidoItem.produtoId = listaPedido[i].id;
                            pedidoItem.pedidoQuantidade = listaPedido[i].quantidade;

                            ok = await pedidoItem.gravar();

                            if(ok){
                                pedido.debitarQuantidade(pedidoItem.produtoId, pedidoItem.pedidoQuantidade);
                            }
                        }
                    }
                    else{
                        msg = "Erro ao gerar pedido!";
                    }

                    const queueId = "ocid1.queue.oc1.phx.amaaaaaafsrhgwyayqwdrefvrekvnb4ma752njfabhqswef2voelkzdp4dwq";
                    const queueRegion = "https://cell-1.queue.messaging.us-phoenix-1.oci.oraclecloud.com";

                    msg = `
                            Olá,<br><br>
                            Agradecemos por sua compra. Informamos que ela foi concluída com sucesso. Estamos processando seu pedido e, em breve, você receberá mais informações sobre a entrega ou disponibilidade do produto/serviço adquirido.<br><br>
                            Caso tenha dúvidas ou precise de suporte, estamos à disposição.<br><br>
                            Atenciosamente,<br>
                            Lojinha Fullstack<br>
                            UNOESTE - Campus 1
                        `;


                    const putMessagesRequest = {
                        queueId: queueId,
                        messages: [ {
                            content: JSON.stringify({email, msg})
                            }
                        ]
                    };
                     
                    await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages`, "POST", putMessagesRequest)

                    msg = "Compra realizada!";


                }
                else{
                    var msgErro = listaErros.join("\n");  
                    msgErro = msgErro.trim(",");
                    msg = "Os seguintes produtos não possuem a quantidade desejada: \n" + msgErro;  
                }
            }
            else{
                msg = "Carrinho vazio!";
            }
        }
        else{
            msg = "Parâmetros inválidos";
        }

        res.send({ok: ok, msg: msg});
    }
}

module.exports = VitrineController;