const { ociHttpRequest } = require("./ociHttpRequest");
const nodemailer = require('nodemailer'); // Importação do nodemailer
const queueId = "ocid1.queue.oc1.phx.amaaaaaafsrhgwyayqwdrefvrekvnb4ma752njfabhqswef2voelkzdp4dwq";
const queueRegion = "https://cell-1.queue.messaging.us-phoenix-1.oci.oraclecloud.com";

async function consumir() {
    try {
        console.log(`Aguardando mensagens na fila: ${queueId}`);

        while (true) {
            // Obtendo as mensagens da fila
            let retorno = await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages?queueId=${queueId}&limit=10`, "GET");
            
            const messages = retorno.messages;
            if (messages.length === 0) {
                console.log("Nenhuma mensagem disponível. Verificando novamente em alguns segundos...");
                // Espera 5 segundos antes de tentar novamente
                await new Promise(res => setTimeout(res, 5000)); 
                continue;
            }

            messages.forEach(async msgFila => {
                try {
                    console.log("Mensagem recebida:", msgFila.content);
            
                    // Converter o conteúdo JSON em um objeto
                    const content = JSON.parse(msgFila.content);
            
                    let email = content.email;
                    let msg = content.msg;
            
                    let receipt = msgFila.receipt;
            
                    // Código para enviar o e-mail
                    enviarEmail("Confirmação de compra realizada", email, msg);
            
                    // Retirar da fila
                    await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages/${receipt}`, "DELETE");
                } catch (ex) {
                    console.error("Erro ao processar mensagem:", ex);
            
                    // Para recolocar a mensagem na fila caso o processamento falhe
                    try {
                        let alteracao = { visibilityInSeconds: 30 };
                        await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages/${msgFila.receipt}`, "PUT", alteracao);
                    } catch (errorUpdate) {
                        console.error("Erro ao atualizar visibilidade da mensagem:", errorUpdate);
                    }
                }
            });
        }
    } catch (err) {
        console.error("Erro ao consumir mensagens:", err);
    }
}

const enviarEmail = (assunto, destinatario, corpoHtml) => {
    console.log(assunto + ' ' + destinatario + ' ' + corpoHtml);

    // Configuração do transportador de e-mail
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'itiel.dario@gmail.com', // Seu e-mail
            pass: 'kpdq osow fhtj cohj' // Sua senha ou app password
        }
    });

    // Detalhes do e-mail
    let mailOptions = {
        from: 'itiel.dario@gmail.com', // Endereço de e-mail do remetente
        to: destinatario,
        subject: assunto,
        html: corpoHtml
    };

    // Enviar e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('E-mail enviado: ' + info.response);
    });
}

consumir();